// avoid m.prop usage for data objects -- based on https://gist.github.com/mindeavor/0bf02f1f21c72de9fb49
m.set = function(obj, prop, modify) {
  return function(value) { obj[prop] = modify ? modify(value) : value };
};

var ConnectForm = {
  controller : function(api, client) {
    if (client && client.connected)
      return m.route('/connected');
    this.props = (localStorage['connect:input'] && JSON.parse(localStorage['connect:input'])) ||
    {
      host      : '',
      port      : '',
      ssl       : false,
      clean     : true,
      keepalive : 30,
      clientId  : '',
      username  : '',
      password  : '',
      will : {
        topic   : '',
        qos     : 0,
        retain  : false,
        payload : '',
      }
    };
    this.onunload = function() {
      localStorage['connect:input'] = JSON.stringify(this.props);
    };
    this.clear = function() {
      localStorage.removeItem('connect:input');
      location.reload();
    };
  },
  view : function(ctrl, api) {
    return (
      <form class="connect-form" onSubmit="event.preventDefault()">
        <div>
          <h5>Connect to broker</h5>
          <button class="button-primary u-pull-right" type="button" onclick={ api.connect.bind(this, ctrl.props) }>Connect</button>
        </div>

        <div class="row">
          <div class="six columns">
            <label for="hostInput">Host</label>
            <input class="u-full-width" type="text" placeholder="some.domain.tld" id="hostInput"
              value={ ctrl.props.host }
              onchange={ m.withAttr('value', m.set(ctrl.props, 'host')) } />
          </div>

          <div class="two columns">
            <label for="portInput">Port</label>
            <input class="u-full-width" type="text" placeholder="8080" id="portInput"
              value={ ctrl.props.port }
              onchange={ m.withAttr('value', m.set(ctrl.props, 'port')) } />
          </div>

          <div class="one column">
            <label for="sslInput">SSL</label>
            <input type="checkbox" id="sslInput"
              checked={ ctrl.props.ssl }
              onclick={ m.withAttr('checked', m.set(ctrl.props, 'ssl')) } />
            <label for="sslInput"></label>
          </div>

          <div class="three columns">
            <label for="cleanInput">Clean session</label>
            <input type="checkbox" id="cleanInput"
              checked={ ctrl.props.clean }
              onclick={ m.withAttr('checked', m.set(ctrl.props, 'clean')) } />
            <label for="cleanInput"></label>
          </div>
        </div>

        <div class="row">
          <div class="four columns">
            <label for="clientInput">ClientId</label>
            <input class="u-full-width" type="text" id="clientInput"
              value={ ctrl.props.clientId }
              onchange={ m.withAttr('value', m.set(ctrl.props, 'clientId')) } />
          </div>

          <div class="two columns">
            <label for="keepaliveInput">Keepalive</label>
            <input class="u-full-width" type="text" placeholder="30" id="keepaliveInput"
              value={ ctrl.props.keepalive }
              onchange={ m.withAttr('value', m.set(ctrl.props, 'keepalive')) } />
          </div>

          <div class="three columns">
            <label for="unameInput">Username</label>
            <input class="u-full-width" type="text" placeholder="" id="unameInput"
              value={ ctrl.props.username }
              onchange={ m.withAttr('value', m.set(ctrl.props, 'username')) } />
          </div>

          <div class="three columns">
            <label for="pwdInput">Password</label>
            <input class="u-full-width" type="text" placeholder="" id="pwdInput"
              value={ ctrl.props.password }
              onchange={ m.withAttr('value', m.set(ctrl.props, 'password')) } />
          </div>
        </div>

        <div class="row">
          <div class="nine columns">
            <label for="pwdInput">Last-will topic</label>
            <input class="u-full-width" type="text" id="pwdInput"
              value={ ctrl.props.will.topic }
              onchange={ m.withAttr('value', m.set(ctrl.props.will, 'topic')) } />
          </div>

          <div class="two columns">
            <label for="qosInput">QoS</label>
            <select class="u-full-width" id="qosInput"
              onchange={ m.withAttr('value', m.set(ctrl.props.will, 'qos', Number)) }>
                {[0, 1, 2].map(function(el) {
                  return (<option value={ el } selected={ el === ctrl.props.will.qos }>{ el }</option>);
                })}
            </select>
          </div>

          <div class="one column">
            <label for="lwtRetainInput">Retain</label>
            <input type="checkbox" id="lwtRetainInput"
              checked={ ctrl.props.will.retain }
              onclick={ m.withAttr('checked', m.set(ctrl.props.will, 'retain')) } />
            <label for="lwtRetainInput"></label>
          </div>
        </div>

        <label for="lwtMessage">Last-will Message</label>
        <textarea class="u-full-width" id="lwtMessage"
          value={ ctrl.props.will.payload }
          onchange={ m.withAttr('value', m.set(ctrl.props.will, 'payload')) }>
        </textarea>

        <button class="button" type="button" onclick={ ctrl.clear }>Clear</button>
      </form>
    );
  },
}


var ConnectedWidget = {
  controller : function(app) {
    if (!app.client)
      m.route('/')
  },
  view : function(_, app) {
    return (
      <div>
        <div>
          <h6>{ '... ' + app.clientId + '@' + app.host}</h6>
          <button class="button-primary u-pull-right" type="button" onclick={ app.disconnect }>
            Disconnect
          </button>
        </div>

        <h5>Subscriptions</h5>
        <SubscriptionList api={ app } />
        <SubscriptionForm api={ app } />

        <h5>Publish</h5>
        <PublishForm api={ app } />

        <h5>Messages</h5>
        <Messages api={ app } />
      </div>
    );
  },
};

var SubscriptionForm = {
  controller : function(app) {
    this.props = {
      topic : '',
      qos   : 0
    };
    this.subscribe = function(obj, event) {
      event.preventDefault();
      if (obj.topic)
        app.api.subscribe(obj);
    };
  },
  view : function(ctrl) {
    return (
      <form class="subscribe-form" onSubmit="event.preventDefault();">
        <div class="row">
          <div class="eight columns">
            <label for="topicInput">Topic</label>
            <input class="u-full-width" type="text" id="hostInput"
              value={ ctrl.props.topic }
              onchange={ m.withAttr('value', m.set(ctrl.props, 'topic')) } />
          </div>

          <div class="two columns">
            <label for="qosInput">QoS</label>
            <select class="u-full-width" id="qosInput"
              onchange={ m.withAttr('value', m.set(ctrl.props, 'qos', Number)) }>
                {[0, 1, 2].map(function(el) {
                  return (<option value={ el }>{ el }</option>);
                })}
            </select>
          </div>

          <div class="two columns">
            <button class="button-primary u-pull-right" type="button"
              onclick={ ctrl.subscribe.bind(this, ctrl.props) }>
              Subscribe
            </button>
          </div>
        </div>
      </form>
    );
  }
};

var SubscriptionList = {
  view : function(ctrl, app) {
    app = app.api;
    return (
      <table class={ app.subscriptions.length ? 'u-full-width subscription-list' : 'u-full-width subscription-list u-hide' }>
        <thead>
          <tr>
            <th>Topic</th>
            <th>QoS</th>
            <th></th>
          </tr>
        </thead>
        <tbody>{
          app.subscriptions.map(function(el) {
            return (<tr>
                      <td>{ el.topic }</td>
                      <td>{ el.qos }</td>
                      <td>
                        <button class="button" type="button"
                          onclick={ app.unsubscribe.bind(this, el.topic) }>
                          Unsubscribe
                        </button>
                      </td>
                    </tr>)
          })}
        </tbody>
      </table>
    );
  }
};

var PublishForm = {
  controller : function(app) {
    this.msg = {
      topic   : '',
      qos     : 0,
      retain  : false,
      payload : ''
    };
    this.publish = function(msg) {
      if (msg.topic.length)
        app.api.publish(msg)
    };
  },
  view : function(ctrl) {
    return (
      <form class="publish-form" onSumbit="event.preventDefault();">
        <div class="row">
          <div class="seven columns">
            <label for="pwdInput">Topic</label>
            <input class="u-full-width" type="text" id="pwdInput"
              value={ ctrl.msg.topic }
              onchange={ m.withAttr('value', m.set(ctrl.msg, 'topic')) } />
          </div>

          <div class="two columns">
            <label for="qosInput">QoS</label>
            <select class="u-full-width" id="qosInput"
              onchange={ m.withAttr('value', m.set(ctrl.msg, 'qos', Number)) }>
                {[0, 1, 2].map(function(el) {
                  return (<option value={ el }>{ el }</option>);
                })}
            </select>
          </div>

          <div class="one column">
            <label for="lwtRetainInput">Retain</label>
            <input type="checkbox" id="lwtRetainInput"
              checked={ ctrl.msg.retain }
              onclick={ m.withAttr('checked', m.set(ctrl.msg, 'retain')) } />
            <label for="lwtRetainInput"></label>
          </div>

          <div class="two columns">
            <button class="button-primary u-pull-right" type="button" onclick={ ctrl.publish.bind(this, ctrl.msg) }>Publish</button>
          </div>
        </div>

        <label for="message">Message</label>
        <textarea class="u-full-width" id="message"
          value={ ctrl.msg.payload }
          onchange={ m.withAttr('value', m.set(ctrl.msg, 'payload')) }>
        </textarea>
      </form>
    );
  },
};

var Messages = {
  view : function(ctrl, app) {
    app = app.api;
    return (
      <div>{
        app.messages.map(function(msg) {
            return (<div>
                      <div class="row">
                        <div class="eight columns">Topic: { msg.topic }</div>
                        <div class="two columns">QoS: { msg.qos }</div>
                        <div class="two columns">{ msg.retained ? 'Retained' : '' }</div>
                      </div>
                      <pre><code>{ msg.payload }</code></pre>
                    </div>
            );
        })
      }</div>
    );
  },
};
