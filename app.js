var App = {
  messages      : [],
  subscriptions : [],
};

App.connect = function(args) {
  App.client = new MqttClient(args);

  App.client
    .on('connect', function() {
      m.route('/connected');
    })
    .on('disconnect', function() {
      App.subscriptions = [];
      m.route('/');
    })
    .on('message', function() {
      console.log('Got message', arguments);
    })
    .connect();

  // expose functionality and data to views
  App.host     = App.client.options.host;
  App.clientId = App.client.options.clientId;

  App.disconnect  = App.client.disconnect;
  App.subscribe = function(param) {
    App.client.subscribe(param.topic, param.qos, function(error, reply) {
      if (error)
        console.error('Error subscribing to ' + param.topic, error);
      else
        App.subscriptions.push({ topic : param.topic, qos : reply.grantedQos[0] });
      m.redraw();
    });
  };

  App.unsubscribe = function(topic) {
    console.log('unsubscribe', topic);
    App.client.unsubscribe(topic, function(error, reply) {
      if (error)
        console.error('Error unsubscribing from ' + topic, error);
      else
        App.subscriptions = App.subscriptions.filter(function(elem) {
          return elem.topic !== topic;
        });
      m.redraw();
    });
  };
  App.publish = App.client.publish;
};


m.route.mode = 'hash';
m.route(document.getElementById('content'), '/', {
  '/'          : m(ConnectForm, { connect: App.connect }),
  '/connected' : m(ConnectedWidget, App),
});