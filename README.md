# web-mqtt-client
> A better MQTT API for the browser

`web-mqtt-client` is a wrapper around the [Eclipse Paho MQTT javascript client](https://eclipse.org/paho/clients/js/), and offers an improved programmatic API somewhat similar to [MQTT.js](https://github.com/mqttjs/MQTT.js) in a much smaller package than the latter browserified. Further improvements will also be implemented as this library matures (see Roadmap below).

An example of this library in use is available on [`gh-pages`](https://orbitbot.github.io/web-mqtt-client), source code and resources for the example under the `demo/` folder.

The event emitter implementations in this project are based on [microevents.js](https://github.com/jeromeetienne/microevent.js).

<br>
Installation
------------

```sh
$ npm install web-mqtt-client
$ bower install web-mqtt-client
```

In addition to `mqtt-client.js`, you will also need to add `mqttws31.js` from [Eclipse Paho](https://eclipse.org/paho/clients/js/) to your html, eg.

```html
<script src="path/to/mqttws31.js"></script>
<script src="path/to/mqtt-client.js"></script>
```

`mqtt-client.js` expects the globals from Eclipse Paho to be available when initialized, so the order of evaluation matters. When the scripts have been evaluated, `web-mqtt-client` is available through the `MqttClient` global.

<br>
API
---

#### MqttClient

An MQTT client is intialized with the call to `new MqttClient`, which accepts the following options:

```js
var client = new MqttClient({
    host        : <required>, 
    port        : <required>,
    clientId    : <optional> - will be randomly generated if not provided,
    timeout     : <optional> - default 10,
    keepalive   : <optional> - default 30,
    mqttVersion : <optional>,
    userName    : <optional>,
    password    : <optional>,
    ssl         : <optional> - default false,
    clean       : <optional> - default true,
    will        : {
        topic   : <required>, 
        payload : <optional>,
        qos     : <optional> - default 0,
        retain  : <optional> - default false
    }
});
```

<br>
The client exposes the following methods

#### client.connect()
#### client.disconnect()

Connect and disconnect to/from the broker specified when this client was initialized. `client.connected` tracks the current state.

#### client.subscribe(topic, qos, callback)

Subscribe to `topic` with `qos`, and optionally attach a callback to be fired when subscription is acknowledged. **NB.** if qos is 0 and a callback is provided, the callback will essentially only mean that the subscription request was delivered to the Paho library.

#### client.unsubscribe(topic, callback)

Unsubscribe from `topic`, `callback` will be fired when the broker acknowledges the request.

#### client.publish(topic, payload, options, callback)

Publish `payload` to `topic`, `callback` will be fired when the broker acknowledges the request. **NB.** if qos is 0 and a callback is provieded functionality is identical to the `subscribe` callback.

`options` are optional and can specify any of the following:
```js
{
    qos    : <optional> - default 0,
    retain : <optional> - deafult false,
}
```

<br>
The client emits the following events 

- `'connect'`: client has connected to broker  
- `'disconnect'`: client was disconnected from broker for whatever reason  
- `'message'`: client received an MQTT message  

Callbacks can be attached to these events through `client.on` or `client.bind` and removed with `client.unbind`.

```js
client.on('connect', function() { console.log("hooraah, I'm connected"); });
client.on('disconnect', function() { console.log('oh noes!'); });
client.on('message', console.log.bind(console));
```

The callback attached to the `message` event will have the following parameters

```js
client.on('message', function handleMessage(topic, payload, details) {
  // ..    
});
```

- `payload` is either the UTF-8 encoded String in the message if parsed by Paho, or the payload as an ArrayBuffer
- `details` is an object containing

```js
{
    topic     : /* String */, 
    qos       : /* 0 | 1 | 2 */,
    retained  : /* boolean  */,
    payload   : /* payloadBytes */,
    duplicate : /* boolean */,
}
```

The meaning of the fields are explained in the [Paho documentation](http://www.eclipse.org/paho/files/jsdoc/symbols/Paho.MQTT.Message.html).


<br>
Roadmap & Changelog
-------------------

**1.1.0**

- [ ] test coverage x
- [ ] optional logging support
- [ ] integration tests against Mosca

**1.0.1**

- [ ] improve unit test coverage
- [ ] fix publish API (call w/o payload, options, callback)
- [ ] subscribe API (document callback, callback this reference)
- [ ] unsubscribe API (document callback, callback this reference)

**1.0.0**

- [x] unit test setup
- [x] CI test configuration (travis)
- [x] eslint configuration
- [x] test coverage x
- [x] lightweight API documentation
- [x] publish demo to gh-pages

**0.9.0**

- [x] randomly generated clientIds
- [x] subscribe / unsubscribe API
- [x] event for incoming messages
- [x] publish API
- [x] lwt support
- [x] minfied build
- [x] public release npm/bower

**Future**

- [ ] better example in README
- [ ] MQTT topic regex support
- [ ] separate messages event API
- [ ] extended connection lifecycle callbacks
- [ ] reconnection callback
- [ ] rewrite Paho Errors
- [ ] proper linting config
- [ ] test coverage x
- [ ] filter subscription/unsubscription calls to broker if topic has other callbacks
- [ ] filter sub/unsub is QoS-aware
- [ ] automatic resubscription of topics on reconnect
- [ ] optimize compression
- [ ] provide sourcemaps

<br>
Notes
-----

- Paho documentation http://www.eclipse.org/paho/files/jsdoc/index.html
- promise support for methods? or example for wrapping
- publish callback if qos 0 is essentially nothing more than a message that message has been delivered to Paho lib...
- piggyback on Paho error reporting or do own validation?

