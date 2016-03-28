# web-mqtt-client
> A better MQTT API for the browser

`web-mqtt-client` is a wrapper around the [Eclipse Paho MQTT javascript client](https://eclipse.org/paho/clients/js/), and offers an improved programmatic API somewhat similar to [MQTT.js](https://github.com/mqttjs/MQTT.js) in a much smaller package than the latter browserified. Further improvements will also be implemented as this library matures (see Roadmap below).

An example of this library in use is available on [`gh-pages`](https://orbitbot.github.io/web-mqtt-client), source code and resources for the example under the `demo/` folder.

The event emitter implementations in this project are based on [microevents.js](https://github.com/jeromeetienne/microevent.js).


Installation
------------

```sh
$ npm install web-mqtt-client
$ bower install web-mqtt-client
```


Roadmap & Changelog
-------------------

**0.9.0**

- [x] randomly generated clientIds
- [x] subscribe / unsubscribe API
- [x] event for incoming messages
- [x] publish API
- [x] lwt support
- [x] minfied build
- [x] public release npm/bower

**1.0.0**

- [x] unit test setup
- [x] CI test configuration (travis)
- [x] eslint configuration
- [x] test coverage x
- [x] lightweight API documentation
- [x] publish demo to gh-pages

Future

- [ ] optional logging support
- [ ] MQTT topic regex support
- [ ] separate messages event API
- [ ] extended connection lifecycle callbacks
- [ ] reconnection callback
- [ ] rewrite Paho Errors
- [ ] proper linting config
- [ ] integration tests against Mosca
- [ ] test coverage x
- [ ] filter subscription/unsubscription calls to broker if topic has other callbacks
- [ ] filter sub/unsub is QoS-aware
- [ ] automatic resubscription of topics on reconnect
- [ ] optimize compression
- [ ] provide sourcemaps


Notes
-----

- Paho documentation http://www.eclipse.org/paho/files/jsdoc/index.html
- promise support for methods? or example for wrapping
- publish callback if qos 0 is essentially nothing more than a message that message has been delivered to Paho lib...
- piggyback on Paho error reporting or do own validation?

