var MqttClient = function(args) { // eslint-disable-line no-unused-vars
  var slice         = Array.prototype.slice;
  var compact       = function(obj) { return JSON.parse(JSON.stringify(obj)); }; // remove undefined fields, also works as copy
  var createMessage = function(topic, payload, qos, retain) {
    var message = new Paho.MQTT.Message(payload);
    message.destinationName = topic;
    message.qos             = Number(qos) || 0;
    message.retained        = !!retain;

    return message;
  };

  var self = this;
  self.connected = false;
  self.broker = compact({
    host     : args.host,
    port     : Number(args.port),
    clientId : args.clientId || 'client-' + Math.random().toString(36).slice(-6),
  });
  self.options = compact({
    timeout           : Number(args.timeout) || 10,
    keepAliveInterval : Number(args.keepalive) || 30,
    mqttVersion       : args.mqttVersion || undefined,
    userName          : args.username || undefined,
    password          : args.password || undefined,
    useSSL            : (args.ssl !== undefined) ? args.ssl : false,
    cleanSession      : (args.clean !== undefined) ? args.clean : true,
    willMessage       : (args.will && args.will.topic.length) ? args.will : undefined,
  });
  self.reconnect = args.reconnect;

  self.emitter = {
    events : {},
    bind   : function(event, func) {
      self.emitter.events[event] = self.emitter.events[event] || [];
      self.emitter.events[event].push(func);

      return self;
    },
    unbind : function(event, func) {
      if (event in self.emitter.events)
        self.emitter.events[event].splice(self.emitter.events[event].indexOf(func), 1);

      return self;
    },
    trigger : function(event) {
      if (event in self.emitter.events) {
        for (var i = 0; i < self.emitter.events[event].length; ++i) {
          try {
            self.emitter.events[event][i].apply(self, slice.call(arguments, 1));
          } catch (e) {
            setTimeout(function() { throw e; }); // ensure error is rethrown successfully
          }
        }
      }
    },
  };
  self.on     = self.emitter.bind;
  self.bind   = self.emitter.bind;
  self.unbind = self.emitter.unbind;
  self.once   = function(event, func) {
    self.on(event, function handle() {
      func.apply(self, slice.call(arguments));
      self.unbind(event, handle);
    });
    return self;
  };


  self.convertTopic = function(topic) {
    return new RegExp('^' + topic.replace(/\+/g, '[^\/]+').replace(/#/g, '.+') + '$');
  };

  self.messages = {
    func    : [],
    count   : function(topic) {
                return self.messages.func.reduce(function(n, elem) { return n + (elem.topic === topic) }, 0);
              },
    bind    : function(topic, qos, callback, force) {
                if (arguments.length === 2 && typeof qos === 'function') {
                  callback = qos;
                  force = callback
                }
                callback.topic = topic;
                callback.re = self.convertTopic(topic);
                callback.qos = Number(qos) || 0;
                self.messages.func.push(callback);

                if (force === true || self.messages.count(topic) === 1) {
                  self.subscribe(topic, qos);
                }

                return self;
              },
    unbind  : function(callback, force) {
                var index = self.messages.func.indexOf(callback);
                if (index > -1) {
                  self.messages.func.splice(index, 1);
                  if (force === true || self.messages.count(callback.topic) < 1) {
                    self.unsubscribe(callback.topic);
                  }
                }

                return self;
              },
    trigger : function(topic) {
                var args = slice.call(arguments, 1);
                self.messages.func.forEach(function(fn) {
                  if (fn.re.test(topic)) {
                    fn.apply(self, args);
                  }
                });
              },
  };
  self.messages.on = self.messages.bind;
  self.on('message', self.messages.trigger);

  self.client = new Paho.MQTT.Client(self.broker.host, self.broker.port, self.broker.clientId);
  self.client.onConnectionLost = self.emitter.trigger.bind(self, 'disconnect');
  self.messageCache = [];
  self.client.onMessageDelivered = function(msg) {
    if (self.messageCache.indexOf(msg) >= 0) {
      self.messageCache.splice(self.messageCache.indexOf(msg))[0].callback();
    }
  };
  self.client.onMessageArrived = function(msg) {
    var payloadString
    try {
      payloadString = msg.payloadString
    } catch(err) {
      // could not parse payloadString
    }
    self.emitter.trigger('message', msg.destinationName, payloadString || msg.payloadBytes, {
      topic     : msg.destinationName,
      qos       : msg.qos,
      retained  : msg.retained,
      payload   : msg.payloadBytes,
      duplicate : msg.duplicate,
    });
  };

  function onDisconnect() {
    self.connected = false;
    if (self.reconnect) {
      setTimeout(function() {
        self.unbind('disconnect', onDisconnect);
        self.connect();
      }, self.reconnect);
    } else {
      self.emitter.trigger('offline');
    }
  }

  self.connect = function() {
    self.once('connect', function() { self.connected = true; });
    self.once('disconnect', onDisconnect);

    var config = compact(self.options);
    config.onSuccess = self.emitter.trigger.bind(self, 'connect');
    config.onFailure = self.emitter.trigger.bind(self, 'disconnect');
    if (config.willMessage) {
      config.willMessage = createMessage(config.willMessage.topic,
                                         config.willMessage.payload,
                                         config.willMessage.qos,
                                         config.willMessage.retain);
    }

    self.client.connect(config);
    self.emitter.trigger('connecting');

    return self;
  };

  self.disconnect = function() {
    self.unbind('disconnect', onDisconnect);
    self.client.disconnect();
    self.emitter.trigger('disconnect');
    self.emitter.trigger('offline');
  };

  self.subscribe = function(topic, qos, callback) {
    if (arguments.length === 2 && typeof arguments[1] === 'function')
      callback = qos;

    self.client.subscribe(topic, callback ? {
      qos       : Number(qos) || 0,
      timeout   : 15,
      onSuccess : function(granted) { callback.call(self, undefined, granted.grantedQos[0]); },
      onFailure : callback.bind(self),
    } : {});
  };

  self.unsubscribe = function(topic, callback) {
    self.client.unsubscribe(topic, callback ? {
      timeout   : 15,
      onSuccess : callback.bind(self, undefined),
      onFailure : callback.bind(self),
    } : {});
  };

  self.publish = function(topic, payload, options, callback) {
    var message = createMessage(topic, payload, options && options.qos, options && options.retain);
    if (callback) {
      if (message.qos < 1) {
        setTimeout(callback);
      } else {
        message.callback = callback;
        self.messageCache.push(message);
      }
    }
    self.client.send(message);
  };

  return self;
};
