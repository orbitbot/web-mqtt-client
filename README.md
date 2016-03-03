# web-mqtt-client
> A better MQTT API for the browser

## Under development, but usable

Example use under the `demo/` folder, while documentation is missing.


Motivation
----------

- Paho offers clunky API
- MQTT.js browserified is large
- neither works completely intelligently re: subscriptions etc


Features
--------

- wraps Eclipse Paho
- no own dependencies
- only x KB, y minified, z, min + gz



Roadmap
-------

- [x] randomly generated clientIds
- [x] subscribe / unsubscribe API
- [x] event for incoming messages
- [x] publish API
- [x] lwt support
- [ ] test coverage x
- [ ] minfied build
- [ ] public release npm/bower
- [ ] optional logging support
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


Notes
-----

- Paho documentation http://www.eclipse.org/paho/files/jsdoc/index.html
- promise support for methods? or example for wrapping
- publish callback if qos 0 is essentially nothing more than a message that message has been delivered to Paho lib...
- piggyback on Paho error reporting or do own validation?

Colophon
--------

- microevents.js