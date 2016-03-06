var chai   = require('chai');
var sinon  = require('sinon');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();


describe('MQTT Client - event emitter', function() {

  var client;
  var clientParams = {
    host      : 'domain.tld',
    port      : 8080,
  };

  beforeEach(function() {
    client = new MqttClient(clientParams);
  });

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
