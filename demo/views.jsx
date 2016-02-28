// avoid m.prop usage -- https://gist.github.com/mindeavor/0bf02f1f21c72de9fb49
m.setValue = function(obj, prop) {
  return m.withAttr('value', function(value) { obj[prop] = value });
};

m.setAttr = function(obj, prop, attr) {
  return m.withAttr(attr, function(value) { obj[prop] = value });
}


var ConnectForm = {
  controller : function(api) {
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
        topic  : '',
        data   : '',
        retain : false,
        qos    : 0,
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
              onchange={ m.setValue(ctrl.props, 'host') } />
          </div>

          <div class="two columns">
            <label for="portInput">Port</label>
            <input class="u-full-width" type="text" placeholder="8080" id="portInput"
              value={ ctrl.props.port }
              onchange={ m.setValue(ctrl.props, 'port') } />
          </div>

          <div class="one column">
            <label for="sslInput">SSL</label>
            <input type="checkbox" id="sslInput"
              checked={ ctrl.props.ssl }
              onclick={ m.setAttr(ctrl.props, 'ssl', 'checked') } />
          </div>

          <div class="three columns">
            <label for="cleanInput">Clean session</label>
            <input type="checkbox" id="cleanInput"
              checked={ ctrl.props.clean }
              onclick={ m.setAttr(ctrl.props, 'clean', 'checked') } />
          </div>
        </div>

        <div class="row">
          <div class="four columns">
            <label for="clientInput">ClientId</label>
            <input class="u-full-width" type="text" id="clientInput"
              value={ ctrl.props.clientId }
              onchange={ m.setValue(ctrl.props, 'clientId') } />
          </div>

          <div class="two columns">
            <label for="keepaliveInput">Keepalive</label>
            <input class="u-full-width" type="text" placeholder="30" id="keepaliveInput"
              value={ ctrl.props.keepalive }
              onchange={ m.setValue(ctrl.props, 'keepalive') } />
          </div>

          <div class="three columns">
            <label for="unameInput">Username</label>
            <input class="u-full-width" type="text" placeholder="" id="unameInput"
              value={ ctrl.props.username }
              onchange={ m.setValue(ctrl.props, 'username') } />
          </div>

          <div class="three columns">
            <label for="pwdInput">Password</label>
            <input class="u-full-width" type="text" placeholder="" id="pwdInput"
              value={ ctrl.props.password }
              onchange={ m.setValue(ctrl.props, 'password') } />
          </div>
        </div>

        <div class="row">
          <div class="nine columns">
            <label for="pwdInput">Last-will topic</label>
            <input class="u-full-width" type="text" id="pwdInput"
              value={ ctrl.props.will.topic }
              onchange={ m.setValue(ctrl.props.will, 'topic') } />
          </div>

          <div class="two columns">
            <label for="qosInput">QoS</label>
            <select class="u-full-width" id="qosInput"
              onchange={ m.setValue(ctrl.props.will, 'qos') }>
                {[0, 1, 2].map(function(el) {
                  return (<option value={ Number(el) }>{ el }</option>);
                })}
            </select>
          </div>

          <div class="one column">
            <label for="lwtRetainInput">Retain</label>
            <input type="checkbox" id="lwtRetainInput"
              checked={ ctrl.props.will.retain }
              onclick={ m.setAttr(ctrl.props.will, 'retain', 'checked') } />
          </div>
        </div>

        <label for="lwtMessage">Last-will Message</label>
        <textarea class="u-full-width" id="lwtMessage"
          value={ ctrl.props.will.data }
          onchange={ m.setValue(ctrl.props.will, 'data') }>
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
              onchange={ m.setValue(ctrl.props, 'topic') } />
          </div>

          <div class="two columns">
            <label for="qosInput">QoS</label>
            <select class="u-full-width" id="qosInput"
              onchange={ m.setValue(ctrl.props, 'qos') }>
                {[0, 1, 2].map(function(el) {
                  return (<option value={ Number(el) }>{ el }</option>);
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
      message : ''
    };
  },
  view : function(ctrl, app) {
    return (
      <form class="publish-form">
        <div class="row">
          <div class="seven columns">
            <label for="pwdInput">Topic</label>
            <input class="u-full-width" type="text" id="pwdInput"
              value={ ctrl.msg.topic }
              onchange={ m.setValue(ctrl.msg, 'topic') } />
          </div>

          <div class="two columns">
            <label for="qosInput">QoS</label>
            <select class="u-full-width" id="qosInput"
              onchange={ m.setValue(ctrl.msg, 'qos') }>
                {[0, 1, 2].map(function(el) {
                  return (<option value={ Number(el) }>{ el }</option>);
                })}
            </select>
          </div>

          <div class="one column">
            <label for="lwtRetainInput">Retain</label>
            <input type="checkbox" id="lwtRetainInput"
              checked={ ctrl.msg.retain }
              onclick={ m.setAttr(ctrl.msg, 'retain', 'checked') } />
          </div>

          <div class="two columns">
            <button class="button-primary u-pull-right" type="button" onclick={ app.api.publish.bind(this, ctrl.msg) }>Publish</button>
          </div>
        </div>

        <label for="message">Message</label>
        <textarea class="u-full-width" id="message"
          value={ ctrl.msg.message }
          onchange={ m.setValue(ctrl.msg, 'message') }>
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
