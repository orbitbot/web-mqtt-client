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

  it('fires disconnect with bad configuration', function (done) {
    client
      .on('disconnect', function() { done(); })
      .connect();
  });
});
