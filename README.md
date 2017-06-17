# web-mqtt-client
> A better MQTT API for the browser

`web-mqtt-client` is a wrapper around the [Eclipse Paho MQTT javascript client](https://eclipse.org/paho/clients/js/), and offers an improved programmatic API somewhat similar to [MQTT.js](https://github.com/mqttjs/MQTT.js) in a much smaller package than the latter browserified. Further improvements will also be implemented as this library matures (see Roadmap below).

An example of this library in use is available on [`gh-pages`](https://orbitbot.github.io/web-mqtt-client), source code and resources for the example under the `demo/` folder.

<br>

### Installation

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

### Usage

An MQTT client is intialized with the call to `new MqttClient` with a configuration object. The configuration object is required to contain `host` and `port`, but accepts multiple other values:

| Parameter     | Mandatory | Type          | Default   |
|:--------------|:----------|:--------------|:----------|
| `host`        | required  | String        |           |
| `port`        | required  | Number        |           |
| `clientId`    | optional  | String        | generated |
| `timeout`     | optional  | Number        | 10        |
| `keepalive`   | optional  | Number        | 30        |
| `mqttVersion` | optional  | Number [3,4]  |           |
| `username`    | optional  | String        |           |
| `password`    | optional  | String        |           |
| `ssl`         | optional  | boolean       |           |
| `clean`       | optional  | boolean       |           |
| `will`        | optional  | Object        |           |
| `reconnect`   | optional  | Number        | undefined |

`reconnect` is the time to wait in milliseconds before trying to connect if a client loses its connection to the broker. If not defined, automatic reconnection is disabled.

Some further details for the parameters can be found in the [Paho documentation](http://www.eclipse.org/paho/files/jsdoc/symbols/Paho.MQTT.Client.html).

Example:

```js
var client = new MqttClient({
  host : 'some.domain.tld/mqtt',
  port : 5678,
  will : {
    topic   : 'farewells',
    payload : 'So long!',
  }
});
```

The `will` object is specified as follows and has the typical MQTT message attributes

| field     | Mandatory | Type                  | Default   |
|:----------|:----------|:----------------------|:----------|
| `topic`   | required  | String                |           |
| `payload` | required  | String or ArrayBuffer |           |
| `qos`     | optional  | Number [0,1,2]        | 0         |
| `retain`  | optional  | boolean               | false     |

<br>

##### Client API

A client `var client = new MqttClient(opts)` initialized as above will have

###### Fields:

**`client.connected` : `boolean`**

Simplified connection state, ie. `true` if connected or `false` otherwise. If you need more detailed connection state tracking, this can be implemented by attaching callbacks to connection lifecycle events (see below).

<br>

###### Methods:

**`client.connect() ⇒ client`**

Connect client to the broker specified in the configuration object.

**`client.disconnect() ⇒ undefined`**

Disconnect from the currently connected broker.

**`client.subscribe(topic, function callback(error, granted) { }) ⇒ undefined`**

**`client.subscribe(topic, qos, function callback(error, granted) { }) ⇒ undefined`**

Subscribe to `topic`. `qos` and `callback` are optional, if two parameters are used the second one is assumed to be a callback function and the default QoS 0 is used. Note that if QoS 0 is passed, the broker does not actually acknowledge receiving the subscription message, so the callback firing essentially only means that the Paho library has processed the function call.

The callback function parameter `error` is the error object returned by Paho, and `granted` is the QoS level (0,1 or 2) granted by the broker.


**`client.unsubscribe(topic, function callback (error) { }) ⇒ undefined`**

Unsubscribe from `topic`. The optional `callback` will be fired when the broker acknowledges the request.

The callback function gets a single error parameter if something went wrong, containing the error object returned by Paho.

**`client.publish(topic, payload, options, callback) ⇒ undefined`**

Publish `payload` to `topic`, `callback` will be fired when the broker acknowledges the request. **NB.** if qos is 0 and a callback is provided functionality is identical to the `subscribe` callback. The callback getting triggered may also be broker-dependant, so verify the functionality before depending on a callback being fired.

`options` are optional and can specify the following:
```js
{
    qos    : <optional> - default 0,
    retain : <optional> - default false,
}
```

<br>


The following event methods are used to attach callbacks to the events specified in the next section.

**`client.bind(event, callback) ⇒ client`**

Attaches `callback` to be called whenever `event` is triggered by the library. See Events below for possible events.

**`client.on(event, callback) ⇒ client`**

Synonym for `client.bind`.

**`client.unbind(event, callback) ⇒ client`**

De-register `callback` from being called when `event` is triggered. Previously registered callbacks must be named variables for this to work, otherwise the method will fail silently.

**`client.once(event, callback) ⇒ client`**

Just like `bind`/`on`, but is automatically de-registered after being called.

<br>

##### Messages API

The client has a utility API that compliments the `client.on('message', callback)` pattern.

**`client.messages.bind(topic, qos, callback, force) ⇒ client`**

Attaches `callback` to be called whenever a message arrives that match the MQTT `topic`. The topic string supports both MQTT wildcard characters, so it can be used fairly flexibly, but verify that your usecase is covered with `client.convertTopic()`. `qos` and `force` parameters are optional, if not supplied `qos` is 0. By default, a MQTT subscribe signal is not sent to the broker if there is already a callback registered with the Messages API that has the same exact string as its topic (wildcard matching is not attempted), `force` can be used to cirumvent this behavior f.e. when `qos` should change or similar.

**`client.messages.on(topic, qos, callback, force) ⇒ client`**

Synonym for `client.messages.bind`.

**`client.messages.unbind(callback) ⇒ client`**

De-register `callback` from being called when incoming messages that matches its `topic` arrive. Previously registered callbacks must be named variables for this to work, otherwise the method will fail silently. For correct functionality, it's also important that the `topic` property added to `callback` in subscribe is not modified elsewhere in code (it should match the string passed when the callback was attached).


<br>

###### Utils:

**`client.convertTopic(topic) ⇒ RegEx`**

Converts string `topic` to a matching regular expression that supports the MQTT topic wildcards (`#` and `+`), used internally. The implementation is not bullet-proof, see tests and verify that the functionality matches your use-case.

<br>

###### Events:

The client emits the following events

- `'connecting'`: client has started connecting to a broker
- `'connect'`: client has successfully connected to broker
- `'disconnect'`: client was disconnected from broker for whatever reason
- `'offline'`: client is disconnected and no automatic reconnection attempts will be made
- `'message'`: client received an MQTT message


As outlined above, callbacks can be attached to these events through `client.on` or `client.bind` and removed with `client.unbind`.

```js
client
  .on('connecting', function() { console.log('connecting...'); })
  .on('connect',    function() { console.log("hooraah, I'm connected"); })
  .on('disconnect', function() { console.log('oh noes!'); })
  .on('offline',    function() { console.log('stopped trying, call connect manually'); });

client.on('message', console.log.bind(console, 'MQTT message arrived: '));
```

The callback attached to the `message` event has the following signature

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

### Colophon

The event emitter pattern that `web-mqtt-client` uses is based on [microevent.js](https://github.com/jeromeetienne/microevent.js).

### License

`web-mqtt-client` is ISC licensed.

<br>

### Roadmap & Changelog

**1.3.1**

- [x] fix for #3, throwing errors when trying to parse some string messages

**1.3.0**

- [x] Messages API automatically subscribes and unsubscribes from topics
- [x] filter subscription/unsubscription calls to broker if topic has other callbacks
- [x] can manually force subscribe or unsubscribe calls using Messages API

**1.2.1**

- [x] fix for #2 Cannot send retained messages using MqttClient's publish method

**1.2.0**

- [x] separate messages event API
- [x] MQTT topic regex support

**1.1.0**

- [x] automatic reconnection interval
- [x] extended connection lifecycle callbacks
- [ ] ~~optional logging support~~ dropped, since it's currently easy to attach logging to callbacks if needed
- [x] integration tests against Mosca

**1.0.1**

- [x] improve test coverage
- [x] fix publish API (call w/o payload, options, callback)
- [x] subscribe API (document callback, callback this reference)
- [x] unsubscribe API (document callback, callback this reference)

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

- [ ] ~~reconnection callback~~ abandoned, can easily be implemented with attaching a function that calls `client.connect()` to the `offline` event
- [ ] better example in README
- [ ] rewrite Paho Errors
- [ ] proper linting config
- [ ] test coverage x
- [ ] ~~filter sub/unsub is QoS-aware~~
- [ ] ~~automatic resubscription of topics on reconnect~~
- [ ] optimize compression
- [ ] provide sourcemaps

<br>

### Notes

- Paho documentation http://www.eclipse.org/paho/files/jsdoc/index.html
- promise support for methods? or example for wrapping
- publish callback if qos 0 is essentially nothing more than a message that message has been delivered to Paho lib...
- piggyback on Paho error reporting or do own validation?

