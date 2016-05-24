var chai   = require('chai');
var sinon  = require('sinon');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();


describe('MQTT Client - connection lifecycle', function() {

  var client;
  var clientParams = {
    host      : 'domain.tld',
    port      : 8080,
    username  : 'user',
    password  : 'pass',
  };

  beforeEach(function() {
    client = new MqttClient(clientParams);
  });

  it('client is initially unconnected', function() {
    client.connected.should.equal(false);
  });

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

  it('fires lifecycle events on a successful connection', function (done) {
    var config;
    var stub = sinon.stub(client.client, 'connect', function(args) { config = args; });

    client
      .on('connecting', function() { config.onSuccess(); })
      .on('connect', done)
      .connect();
  });

  it('fires lifecycle events on a failed connection', function(done) {
    var config;
    var disconnectSpy = sinon.spy();
    var stub = sinon.stub(client.client, 'connect', function(args) { config = args; });

    client
      .on('connecting', function() { config.onFailure(); })
      .on('disconnect', disconnectSpy)
      .on('offline', function() {
        disconnectSpy.calledOnce.should.equal(true);
        done();
      })
      .connect();
  });

  it('goes offline if disconnect is called', function(done) {
    var config;
    var disconnectSpy = sinon.spy();
    var stub = sinon.stub(client.client, 'connect', function(args) { config = args; });
    client.client.disconnect = sinon.spy();

    client
      .on('connecting', function() { config.onSuccess(); })
      .on('connect', function() {
        client.disconnect();
      })
      .on('disconnect', disconnectSpy)
      .on('offline', function() {
        client.client.disconnect.calledOnce.should.equal(true);
        disconnectSpy.calledOnce.should.equal(true);
        done();
      })
      .connect();
  });

  describe('automatic reconnection', function() {

    before(function() {
      clientParams.reconnect = 5;
    });

    after(function() {
      delete clientParams.reconnect;
    })

    it('automatically reconnects if a reconnection interval is passed', function(done) {
      var config;
      var calledOnce = false;
      var stub = sinon.stub(client.client, 'connect', function(args) { config = args; });

      client
        .on('connecting', function() {
          if (calledOnce) {
            done();
          } else {
            calledOnce = true;
            config.onSuccess();
          }
        })
        .on('connect', function() {
          client.emitter.trigger('disconnect');
        })
        .connect();
    });
  })

});
