var chai   = require('chai');
var sinon  = require('sinon');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();


describe('MQTT Client - subscribe and unsubscribe', function() {

  var client;

  beforeEach(function(done) {
    client = new MqttClient({
      host : 'localhost',
      port : 8080
    });
    client.on('connect', function() {
        done();
      })
      .connect();
  });

  afterEach(function(done) {
    client.disconnect();
    done();
  });

  it('subscribes to topics', function(done) {
    client.subscribe('someTopic', 1, function(err, granted) {
      if (err) done(err);

      granted.should.equal(1);
      done();
    });
  });

  it('defaults to QoS 0 if no parameter is passed', function(done) {
    client.subscribe('someTopic', undefined, function(err, granted) {
      if (err) done(err);

      granted.should.equal(0);
      done();
    });
  });

  it('handles subscribe with two parameters', function(done) {
    client.subscribe('someTopic', function(err, granted) {
      if (err) done(err);

      granted.should.equal(0);
      done();
    });
  });

  it('unsubscribes from topics', function(done) {
    client.subscribe('someTopic', 1, function(err) {
      if (err) done(err);

      client.unsubscribe('someTopic', function(err) {
        if (err) done(err);
        done();
      });
    });
  });

  it('succeeds when unsubscribing from topic not subscribed to', function(done) {
    client.unsubscribe(Math.random().toString(), function(err) {
      if (err) done(err);
      done();
    });
  });

});
