var MqttClient = function(args) { // eslint-disable-line no-unused-vars
  'use strict';
  var self = this;
  self.connected = false;
  self.options   = JSON.parse(JSON.stringify({  // remove undefined fields
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
  }));

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
            self.emitter.events[event][i].apply(self, Array.prototype.slice.call(arguments, 1));
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
  self.client.onMessageArrived = self.emitter.trigger.bind(self, 'message');

  self.connect = function() {
    self.on('connect',    function() { self.connected = true; });
    self.on('disconnect', function() { self.connected = false; });

    var connectOptions = Object.create(self.options);
    connectOptions.onSuccess = self.emitter.trigger.bind(self, 'connect');
    connectOptions.onFailure = self.emitter.trigger.bind(self, 'disconnect');

    self.client.connect(connectOptions);

    return self;
  };

  self.disconnect = function() {
    console.log('disconnect');
    self.client.disconnect();
  };

  self.publish = function() {
    console.log('publish', arguments);
  };

  self.subscribe = function() {
    console.log('subscribe', arguments);
  };

  self.unsubscribe = function() {
    console.log('unsubscribe', arguments);
  };

  return self;
}