var MqttClient = function(args) { // eslint-disable-line no-unused-vars
  'use strict';
  var slice         = Array.prototype.slice;
  var compact       = function(obj) { return JSON.parse(JSON.stringify(obj)); } // remove undefined fields, also works as copy
  var createMessage = function(topic, payload, qos, retain) {
    var message = new Paho.MQTT.Message(payload);
    message.destinationName = topic;
    message.qos             = Number(qos) || 0;
    message.retain          = retain !== undefined ? retain : false;

    return message;
  };

  var self = this;
  self.connected = false;
  self.broker = compact({
    host              : args.host,
    port              : Number(args.port),
    clientId          : args.clientId || 'client-' + Math.random().toString(36).slice(-6),
  });
  self.options   = compact({
    timeout           : Number(args.timeout)   || 10,
    keepAliveInterval : Number(args.keepalive) || 30,
    mqttVersion       : args.mqttVersion       || undefined, 
    userName          : args.username          || undefined,
    password          : args.password          || undefined,
    useSSL            : (args.ssl !== undefined) ? args.ssl : false,
    cleanSession      : (args.clean !== undefined) ? args.clean : true,
    willMessage       : (args.will && args.will.topic.length) ? args.will : undefined,
  });

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

  self.client = new Paho.MQTT.Client(self.broker.host, self.broker.port, self.broker.clientId);
  self.client.onConnectionLost = self.emitter.trigger.bind(self, 'disconnect');
  self.messageCache = [];
  self.client.onMessageDelivered = function(msg) {
    if (self.messageCache.indexOf(msg) >= 0)
      self.messageCache.splice(self.messageCache.indexOf(msg))[0].callback();
  };
  self.client.onMessageArrived = function(msg) {
    self.emitter.trigger('message', msg.destinationName, msg.payloadString || msg.payloadBytes, {
      topic     : msg.destinationName,
      qos       : msg.qos,
      retained  : msg.retained,
      payload   : msg.payloadBytes,
      duplicate : msg.duplicate,
    });
  }

  self.connect = function() {
    self.on('connect',    function() { self.connected = true; });
    self.on('disconnect', function() { self.connected = false; });

    var config = compact(self.options);
    config.onSuccess = self.emitter.trigger.bind(self, 'connect');
    config.onFailure = self.emitter.trigger.bind(self, 'disconnect');
    if (config.willMessage)
      config.willMessage = createMessage(config.willMessage.topic, config.willMessage.payload, config.willMessage.qos, config.willMessage.retain);

    self.client.connect(config);

    return self;
  };

  self.disconnect = function() {
    self.client.disconnect();
  };

  self.subscribe = function(topic, qos, callback) {
    self.client.subscribe(topic, callback ? {
      qos       : Number(qos) || 0,
      timeout   : 15,
      onSuccess : callback.bind(self, null),
      onFailure : callback.bind()
    } : {});
  };

  self.unsubscribe = function(topic, callback) {
    self.client.unsubscribe(topic, callback ? {
      timeout   : 15,
      onSuccess : callback.bind(self, null),
      onFailure : callback.bind()
    } : {});
  };

  self.publish = function(topic, payload, options, callback) {
    var message = createMessage(topic, payload, options.qos, options.retain);
    if (callback) {
      if (message.qos < 1) {
        setTimeout(function() { callback(); })
      } else {
        message.callback = callback;
        self.messageCache.push(message);
      }
    }
    self.client.send(message);
  };

  return self;
}