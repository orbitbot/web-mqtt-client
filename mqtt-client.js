var MqttClient = function(args) { // eslint-disable-line no-unused-vars
  'use strict';
  var slice   = Array.prototype.slice;
  var compact = function(obj) { return JSON.parse(JSON.stringify(obj)); } // remove undefined fields

  var self = this;
  self.connected = false;
  self.options   = compact({
    host              : args.host,
    port              : Number(args.port),
    timeout           : Number(args.timeout)   || 10,
    useSSL            : args.ssl               || false,
    cleanSession      : args.clean             || true,
    keepAliveInterval : Number(args.keepalive) || 30,
    clientId          : args.clientId          || 'client-' + Math.random().toString(36).slice(-6),
    mqttVersion       : args.mqttVersion       || undefined, 
    userName          : args.username          || undefined,
    password          : args.password          || undefined,
  });

  self.emitter = {
    events : {},
    bind   : function(event, func) {
      self.emitter.events[event] = self.emitter.events[event] || [];
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

  self.client = new Paho.MQTT.Client(self.options.host, self.options.port, self.options.clientId);
  self.client.onConnectionLost = self.emitter.trigger.bind(self, 'disconnect');
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

    var config = Object.create(self.options);
    config.onSuccess = self.emitter.trigger.bind(self, 'connect');
    config.onFailure = self.emitter.trigger.bind(self, 'disconnect');

    self.client.connect(config);

    return self;
  };

  self.disconnect = function() {
    console.log('disconnect');
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

  self.publish = function() {
    console.log('publish', arguments);
  };

  return self;
}