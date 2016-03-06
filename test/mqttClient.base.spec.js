var chai   = require('chai');
var sinon  = require('sinon');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();


describe('MQTT Client', function() {

  var client;
  var clientParams = {
    host        : 'domain.tld',
    port        : 8080,
    timeout     : 5,
    ssl         : true,
    clean       : false,
    keepalive   : 15,
    mqttVersion : 4,
    clientId    : 'testClientId',
    username    : 'user',
    password    : 'pass',
    will        : {
      payload : 'bye',
      retain  : true,
      qos     : 3,
      topic   : 'status'
    }
  };

  beforeEach(function() {
    client = new MqttClient(clientParams);
  });

  it('has initial state', function() {
    client = new MqttClient({ host: 'domain.tld', port: 8000 });
    (client.client instanceof Paho.MQTT.Client).should.equal(true);
    client.connected.should.equal(false);
    client.options.should.deep.equal({
      timeout           : 10,
      useSSL            : false,
      cleanSession      : true,
      keepAliveInterval : 30,
    });
    client.broker.clientId.should.not.equal(undefined);
  });

  it('supports configuriring MQTT connection', function() {
    // internally rewritten to Paho-compatible form, and broker options kept separate
    client.options.should.deep.equal({
      timeout           : 5,
      useSSL            : true,
      cleanSession      : false,
      keepAliveInterval : 15,
      mqttVersion       : 4,
      userName          : 'user',
      password          : 'pass',
      willMessage       : {
        payload : 'bye',
        retain  : true,
        qos     : 3,
        topic   : 'status'
      },
    });
  });

  it('supports MQTT API', function() {
    assert.isFunction(client.connect, 'connect');
    assert.isFunction(client.disconnect, 'disconnect');
    assert.isFunction(client.publish, 'publish');
    assert.isFunction(client.subscribe, 'subscribe');
    assert.isFunction(client.unsubscribe, 'unsubscribe');
  });

});
