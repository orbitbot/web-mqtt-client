var chai   = require('chai');
var sinon  = require('sinon');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();


describe('MQTT Client - publish', function() {

  var client;
  var connOpts = {
    host : 'localhost',
    port : 8080
    // host : 'broker.mqttdashboard.com',
    // port : 8000
  };


  beforeEach(function(done) {
    client = new MqttClient(connOpts);
    client.on('connect', function() {
        done();
      })
      .connect();
  });

  afterEach(function(done) {
    client.disconnect();
    done();
  });

  it('publishes messages to a broker and supplies defaults to unsupplied parameters', function(done) {
    client.subscribe('echo');
    client.on('message', function(topic, payload, message) {
      payload.toString().should.equal('');
      message.qos.should.equal(0);
      message.retained.should.equal(false);
      done();
    });

    client.publish('echo', '');
  });

  // skipped since Mosca doesn't seem to support this correctly...
  it.skip('supports callbacks for when messages have been delivered', function(done) {
    client.publish('echo', 'boo', { qos: 2 }, function() {
      done()
    });
  });

  it('supports retained messages', function(done) {
    client.publish('retainTest', 'payload', { retain: true });

    client2 = new MqttClient(connOpts);
    client2.on('connect', function() {

        client2.on('message', function(topic, payload, message) {
          topic.should.equal('retainTest');
          payload.should.equal('payload');
          // message.retained.should.equal(true);  -- check seems to fail with mosca, even when retained message is delivered
          client2.disconnect();
          done();
        });

        client2.subscribe('retainTest');
      })
      .connect();
  });

  describe('QoS parameters', function() {
    it('supports setting QoS 1 when publishing', function(done) {
      client.subscribe('echo', 1, function(err, granted) {
        granted.should.equal(1);
      });
      client.on('message', function(topic, payload, message) {
        message.qos.should.equal(1);
        done();
      });

      client.publish('echo', '', { qos: 1 });
    });

    // skip test as Mosca does not support QoS 2, should work against other brokers
    it.skip('supports setting QoS 2 when publishing', function(done) {
      client.subscribe('echo', 2, function(err, granted) {
        granted.should.equal(2);
      });
      client.on('message', function(topic, payload, message) {
        message.qos.should.equal(2);
        done();
      });

      client.publish('echo', '', { qos: 2 });
    });
  });

});
