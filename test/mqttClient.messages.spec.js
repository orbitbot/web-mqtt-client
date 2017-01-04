var chai   = require('chai');
var sinon  = require('sinon');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();


describe('MQTT Client - messages API', function() {

  var client;
  var clientParams = {
    host : 'domain.tld',
    port : 8080,
  };

  beforeEach(function() {
    client = new MqttClient(clientParams);
  });

  it('supports registering and removing callbacks', function() {
    client.subscribe = function() {}
    client.unsubscribe = function() {}
    client.messages.func.length.should.equal(0);

    var callback = function() {};

    client.messages.on('some/topic', 1, callback);
    client.messages.on('another/+/topic', 2, callback);

    client.messages.func.length.should.equal(2);

    client.messages.unbind(callback);
    client.messages.func.length.should.equal(1);

    client.messages.unbind(callback);

    client.messages.func.length.should.equal(0);
  });

  it('executes all callbacks that match a topic', function() {
    client.subscribe = function() {}
    var fst = sinon.spy();
    var snd = sinon.spy();
    var trd = sinon.spy();

    client.messages.on('foo/+/baz', fst);
    client.messages.on('foo/+/#', snd);
    client.messages.on('#', trd);

    client.client.onMessageArrived({
      destinationName: 'foo/bar/baz'
    });

    fst.callCount.should.equal(1);
    snd.callCount.should.equal(1);
    trd.callCount.should.equal(1);
  });

  it('does not execute callbacks that do not match topics', function() {
    client.subscribe = function() {}
    var fst = sinon.spy();
    var snd = sinon.spy();
    var trd = sinon.spy();

    client.messages.on('foo/+/baz', fst);
    client.messages.on('foo/+/#', snd);
    client.messages.on('foo/bar', trd);

    client.client.onMessageArrived({
      destinationName: 'foo/bar/baz'
    });

    fst.callCount.should.equal(1);
    snd.callCount.should.equal(1);
    trd.callCount.should.equal(0);
  });

  it('passes parameters to callback functions', function() {
    client.subscribe = function() {}
    var spy = sinon.spy();
    var mqttMessage = {
      destinationName : 'some/topic',
      payloadString   : 'content',
      qos             : 1,
      retained        : true,
      duplicate       : false
    };

    client.messages.on('some/topic', spy);
    client.client.onMessageArrived(mqttMessage);

    spy.called.should.equal(true);
    spy.calledWith('content', sinon.match({ topic: 'some/topic', qos: 1, retained: true, duplicate: false })).should.equal(true);
  });

  it('automatically subscribes client to topics', function() {
    client.subscribe = sinon.spy()
    var topic = 'some/topic'
    var qos = 2

    client.messages.on(topic, qos, () => {})

    client.subscribe.called.should.equal(true)
    client.subscribe.calledWith(topic, qos).should.equal(true)
  })

  it('automatically unsubscribes client from topics', () => {
    client.subscribe = () => {}
    client.unsubscribe = sinon.spy()
    let topic = 'some/topic'
    let cb = () => {}

    client.messages.on(topic, cb)
    client.messages.unbind(cb)

    client.unsubscribe.called.should.equal(true)
    client.unsubscribe.calledWith(topic).should.equal(true)
  })

  it('does not send additional subscribe to broker if the same topic is subscribed to already', () => {
    client.subscribe = sinon.spy()
    var topic = 'some/topic'
    var qos = 2

    client.messages.on(topic, qos, () => {})

    client.subscribe.callCount.should.equal(1)
    client.subscribe.calledWith(topic, qos).should.equal(true)

    client.messages.on(topic, () => {})
    client.subscribe.callCount.should.equal(1)
  })

  it('does not unsubscribe from topic if other subscriptions exist', () => {
    client.subscribe = () => {}
    client.unsubscribe = sinon.spy()
    let topic = 'some/topic'
    let cb = () => {}

    client.messages.on(topic, cb)
    client.messages.on(topic, () => {})
    client.messages.unbind(cb)

    client.unsubscribe.called.should.equal(false)
  })

  it('sends subscribe to broker if force parameter is true', () => {
    client.subscribe = sinon.spy()
    var topic = 'some/topic'
    var qos = 2

    client.messages.on(topic, qos, () => {})

    client.subscribe.callCount.should.equal(1)
    client.subscribe.calledWith(topic, qos).should.equal(true)

    client.messages.on(topic, () => {}, true)
    client.subscribe.callCount.should.equal(2)
  })

  it('sends unsubscribe to broker if force parameter is true', () => {
    client.subscribe = () => {}
    client.unsubscribe = sinon.spy()
    let topic = 'some/topic'
    let cb = () => {}

    client.messages.on(topic, cb)
    client.messages.on(topic, () => {})
    client.messages.unbind(cb, true)

    client.unsubscribe.called.should.equal(true)
    client.unsubscribe.calledWith(topic).should.equal(true)
  })
});
