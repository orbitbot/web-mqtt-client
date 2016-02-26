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
      m.route('/');
    })
    .connect();

  // expose functionality and data to views
  App.host     = App.client.options.host;
  App.clientId = App.client.options.clientId;

  App.disconnect  = App.client.disconnect;
  App.publish     = App.client.publish;
  App.subscribe   = App.client.subscribe;
  App.unsubscribe = App.client.unsubscribe;
};


m.route.mode = 'hash';
m.route(document.getElementById('content'), '/', {
  '/'          : m(ConnectForm, { connect: App.connect }),
  '/connected' : m(ConnectedWidget, App),
});