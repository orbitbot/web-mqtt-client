var chai   = require('chai');
var sinon  = require('sinon');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();


describe('MQTT Client', function() {

  var client;
  var clientParams = {
    host      : 'domain.tld',
    port      : 8080,
    ssl       : false,
    clean     : true,
    keepalive : 30,
    clientId  : 'testClientId',
    username  : 'user',
    password  : 'pass',
  };

  beforeEach(function() {
    client = new MqttClient(clientParams);
  });

  it('has initial state', function() {
    (client.client instanceof Paho.MQTT.Client).should.equal(true);
    client.connected.should.equal(false);
    client.options.should.equal(clientParams);
  });

  it('supports MQTT API', function() {
    assert.isFunction(client.connect, 'connect');
    assert.isFunction(client.disconnect, 'disconnect');
    assert.isFunction(client.publish, 'publish');
    assert.isFunction(client.subscribe, 'subscribe');
    assert.isFunction(client.unsubscribe, 'unsubscribe');
  })

  describe('Event emitter', function() {

    it('supports adding callback functions', function() {
      client
        .on('someEvent', function() {})
        .on('anotherEvent', function() {});

      client.emitter.events.should.contain.keys('someEvent', 'anotherEvent');
    });

    it('supports removing named callback functions', function() {
      function callback() {}

      client.on('someEvent', callback);
      client.emitter.events.should.contain.keys('someEvent');
      client.emitter.events['someEvent'].length.should.equal(1);

      client.unbind('someEvent', callback);
      client.emitter.events['someEvent'].length.should.equal(0);
    });

    it('fires matching callbacks for events with the arguments passed', function() {
      var spyOne = sinon.spy();
      var spyTwo = sinon.spy();
      var spyThree = sinon.spy();

      client.on('someEvent', spyOne);
      client.on('someEvent', spyTwo)
      client.on('anotherEvent', spyThree);

      client.emitter.trigger('someEvent', false)

      expect(spyOne.calledWith(false)).to.equal(true);
      expect(spyTwo.calledWith(false)).to.equal(true);
      expect(spyThree.called).to.equal(false);
    });
  });

  describe('Connection lifecycle', function() {

    it('Paho Library connect is called with stored configuration and connection handlers', function() {
      var params;
      client.client.connect = function(args) { params = args };

      client.connect();
      params.should.contain.keys('keepAliveInterval', 'cleanSession', 'useSSL', 'userName', 'password');
      params.userName.should.equal(clientParams.username);
      params.password.should.equal(clientParams.password);
      assert.isFunction(params.onSuccess, 'onSuccess');
      assert.isFunction(params.onFailure, 'onFailure');
    });

    it('fires disconnect with bad configuration', function (done) {
      client
        .on('disconnect', function() { done(); })
        .connect();
    });
  });
});
