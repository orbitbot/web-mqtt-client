var App = {
  messages      : [],
  subscriptions : [],
};

App.connect = function(args) {
  App.client = new MqttClient(args);

  App.client
    .on('connect', function() {
      console.info('connected to ' + App.client.broker.host + ':' + App.client.broker.port + ' as ' + App.client.broker.clientId);
      m.route('/connected');
    })
    .on('disconnect', function() {
      console.info(App.client.broker.clientId + ' disconnected');
      App.subscriptions = [];
      m.route('/');
    })
    .on('message', function(topic, payload, message) {
      console.info('got message ' + topic + ' : ' + payload);
      App.messages.push({
        topic    : topic,
        payload  : payload,
        qos      : message.qos,
        retained : message.retained,
      });
      m.redraw();
    })
    .connect();

  // expose functionality and data to views
  App.host     = App.client.broker.host;
  App.clientId = App.client.broker.clientId;

  App.disconnect  = App.client.disconnect;
  App.subscribe = function(param) {
    App.client.subscribe(param.topic, param.qos, function(error, granted) {
      if (error) {
        console.error('Error subscribing to ' + param.topic, error);
      } else {
        console.info('subscribed to ' + param.topic + ' with QoS ' + param.granted);
        App.subscriptions.push({ topic : param.topic, qos : granted });
      }
      m.redraw();
    });
  };

  App.unsubscribe = function(topic) {
    App.client.unsubscribe(topic, function(error, reply) {
      if (error) {
        console.error('Error unsubscribing from ' + topic, error);
      } else {
        console.info('unsubscribed from ' + topic);
        App.subscriptions = App.subscriptions.filter(function(elem) {
          return elem.topic !== topic;
        });
      }
      m.redraw();
    });
  };

  App.publish = function(param) {
    App.client.publish(param.topic, param.payload, param, function() { console.log('Published', param); });
  };
};


m.route.mode = 'hash';
m.route(document.getElementById('content'), '/', {
  '/'          : m(ConnectForm, { connect: App.connect }, App),
  '/connected' : m(ConnectedWidget, App),
});
