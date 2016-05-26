var chai   = require('chai');
var sinon  = require('sinon');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();


describe('MQTT Utils - Regex converter', function() {

  var client;
  var clientParams = {
    host      : 'domain.tld',
    port      : 8080,
  };

  beforeEach(function() {
    client = new MqttClient(clientParams);
  });

  it('should generate topic regular expressions', function() {
    expect(client.convertTopic).to.not.equal(undefined);

    var regex = client.convertTopic('test/topic');
    expect(regex).to.not.equal(undefined);
    expect(regex instanceof RegExp).to.equal(true);
  });

  it('should match the correct regular expressions', function() {

    function verify(subscription, topic, match) {
      var regex = client.convertTopic(subscription);
      regex.test(topic).should.equal(match);
    }

    verify('foo/bar'  , 'foo/bar'    , true); // exact match
    verify('foo/+'    , 'foo/bar'    , true); // single level of wildcard
    verify('foo/+/baz', 'foo/bar/baz', true); //
    verify('foo/+/#'  , 'foo/bar/baz', true); //
    verify('#'        , 'foo/bar/baz', true); // wildcard

    verify('foo/bar'  , 'foo'        , false); // missing subtopic
    verify('foo/+'    , 'foo/bar/baz', false); // extra subtopic
    verify('foo/+/baz', 'foo/bar/bar', false); // wrong subtopic
    verify('foo/+/#'  , 'fo2/bar/baz', false); // wrong subtopic

    verify('#' , '/foo/bar', true);  // match leading empty subtopic
    verify('/#', '/foo/bar', true);  //
    verify('/#', 'foo/bar' , false); //

    verify('foo//bar'   , 'foo//bar' , true); // match empty subtopics
    verify('foo//+'     , 'foo//bar' , true);
    // verify('foo/+/+/baz', 'foo///baz', true); // !!
    // verify('foo/bar/+'  , 'foo/bar/' , true); // !!
  });
});
