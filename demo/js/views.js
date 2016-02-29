// avoid m.prop usage -- https://gist.github.com/mindeavor/0bf02f1f21c72de9fb49
m.setValue = function(obj, prop) {
  return m.withAttr('value', function(value) { obj[prop] = value });
};

m.setAttr = function(obj, prop, attr) {
  return m.withAttr(attr, function(value) { obj[prop] = value });
}


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
      {tag: "form", attrs: {class:"connect-form", onSubmit:"event.preventDefault()"}, children: [
        {tag: "div", attrs: {}, children: [
          {tag: "h5", attrs: {}, children: ["Connect to broker"]}, 
          {tag: "button", attrs: {class:"button-primary u-pull-right", type:"button", onclick: api.connect.bind(this, ctrl.props) }, children: ["Connect"]}
        ]}, 

        {tag: "div", attrs: {class:"row"}, children: [
          {tag: "div", attrs: {class:"six columns"}, children: [
            {tag: "label", attrs: {for:"hostInput"}, children: ["Host"]}, 
            {tag: "input", attrs: {class:"u-full-width", type:"text", placeholder:"some.domain.tld", id:"hostInput", 
              value: ctrl.props.host, 
              onchange: m.setValue(ctrl.props, 'host') }}
          ]}, 

          {tag: "div", attrs: {class:"two columns"}, children: [
            {tag: "label", attrs: {for:"portInput"}, children: ["Port"]}, 
            {tag: "input", attrs: {class:"u-full-width", type:"text", placeholder:"8080", id:"portInput", 
              value: ctrl.props.port, 
              onchange: m.setValue(ctrl.props, 'port') }}
          ]}, 

          {tag: "div", attrs: {class:"one column"}, children: [
            {tag: "label", attrs: {for:"sslInput"}, children: ["SSL"]}, 
            {tag: "input", attrs: {type:"checkbox", id:"sslInput", 
              checked: ctrl.props.ssl, 
              onclick: m.setAttr(ctrl.props, 'ssl', 'checked') }}
          ]}, 

          {tag: "div", attrs: {class:"three columns"}, children: [
            {tag: "label", attrs: {for:"cleanInput"}, children: ["Clean session"]}, 
            {tag: "input", attrs: {type:"checkbox", id:"cleanInput", 
              checked: ctrl.props.clean, 
              onclick: m.setAttr(ctrl.props, 'clean', 'checked') }}
          ]}
        ]}, 

        {tag: "div", attrs: {class:"row"}, children: [
          {tag: "div", attrs: {class:"four columns"}, children: [
            {tag: "label", attrs: {for:"clientInput"}, children: ["ClientId"]}, 
            {tag: "input", attrs: {class:"u-full-width", type:"text", id:"clientInput", 
              value: ctrl.props.clientId, 
              onchange: m.setValue(ctrl.props, 'clientId') }}
          ]}, 

          {tag: "div", attrs: {class:"two columns"}, children: [
            {tag: "label", attrs: {for:"keepaliveInput"}, children: ["Keepalive"]}, 
            {tag: "input", attrs: {class:"u-full-width", type:"text", placeholder:"30", id:"keepaliveInput", 
              value: ctrl.props.keepalive, 
              onchange: m.setValue(ctrl.props, 'keepalive') }}
          ]}, 

          {tag: "div", attrs: {class:"three columns"}, children: [
            {tag: "label", attrs: {for:"unameInput"}, children: ["Username"]}, 
            {tag: "input", attrs: {class:"u-full-width", type:"text", placeholder:"", id:"unameInput", 
              value: ctrl.props.username, 
              onchange: m.setValue(ctrl.props, 'username') }}
          ]}, 

          {tag: "div", attrs: {class:"three columns"}, children: [
            {tag: "label", attrs: {for:"pwdInput"}, children: ["Password"]}, 
            {tag: "input", attrs: {class:"u-full-width", type:"text", placeholder:"", id:"pwdInput", 
              value: ctrl.props.password, 
              onchange: m.setValue(ctrl.props, 'password') }}
          ]}
        ]}, 

        {tag: "div", attrs: {class:"row"}, children: [
          {tag: "div", attrs: {class:"nine columns"}, children: [
            {tag: "label", attrs: {for:"pwdInput"}, children: ["Last-will topic"]}, 
            {tag: "input", attrs: {class:"u-full-width", type:"text", id:"pwdInput", 
              value: ctrl.props.will.topic, 
              onchange: m.setValue(ctrl.props.will, 'topic') }}
          ]}, 

          {tag: "div", attrs: {class:"two columns"}, children: [
            {tag: "label", attrs: {for:"qosInput"}, children: ["QoS"]}, 
            {tag: "select", attrs: {class:"u-full-width", id:"qosInput", 
              onchange: m.setValue(ctrl.props.will, 'qos') }, children: [
                [0, 1, 2].map(function(el) {
                  return ({tag: "option", attrs: {value: Number(el) }, children: [ el ]});
                })
            ]}
          ]}, 

          {tag: "div", attrs: {class:"one column"}, children: [
            {tag: "label", attrs: {for:"lwtRetainInput"}, children: ["Retain"]}, 
            {tag: "input", attrs: {type:"checkbox", id:"lwtRetainInput", 
              checked: ctrl.props.will.retain, 
              onclick: m.setAttr(ctrl.props.will, 'retain', 'checked') }}
          ]}
        ]}, 

        {tag: "label", attrs: {for:"lwtMessage"}, children: ["Last-will Message"]}, 
        {tag: "textarea", attrs: {class:"u-full-width", id:"lwtMessage", 
          value: ctrl.props.will.payload, 
          onchange: m.setValue(ctrl.props.will, 'payload') }
        }, 

        {tag: "button", attrs: {class:"button", type:"button", onclick: ctrl.clear}, children: ["Clear"]}
      ]}
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
      {tag: "div", attrs: {}, children: [
        {tag: "div", attrs: {}, children: [
          {tag: "h6", attrs: {}, children: [ '... ' + app.clientId + '@' + app.host]}, 
          {tag: "button", attrs: {class:"button-primary u-pull-right", type:"button", onclick: app.disconnect}, children: [
            "Disconnect"
          ]}
        ]}, 

        {tag: "h5", attrs: {}, children: ["Subscriptions"]}, 
        m.component(SubscriptionList, {api: app }), 
        m.component(SubscriptionForm, {api: app }), 

        {tag: "h5", attrs: {}, children: ["Publish"]}, 
        m.component(PublishForm, {api: app }), 

        {tag: "h5", attrs: {}, children: ["Messages"]}, 
        m.component(Messages, {api: app })
      ]}
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
      {tag: "form", attrs: {class:"subscribe-form", onSubmit:"event.preventDefault();"}, children: [
        {tag: "div", attrs: {class:"row"}, children: [
          {tag: "div", attrs: {class:"eight columns"}, children: [
            {tag: "label", attrs: {for:"topicInput"}, children: ["Topic"]}, 
            {tag: "input", attrs: {class:"u-full-width", type:"text", id:"hostInput", 
              value: ctrl.props.topic, 
              onchange: m.setValue(ctrl.props, 'topic') }}
          ]}, 

          {tag: "div", attrs: {class:"two columns"}, children: [
            {tag: "label", attrs: {for:"qosInput"}, children: ["QoS"]}, 
            {tag: "select", attrs: {class:"u-full-width", id:"qosInput", 
              onchange: m.setValue(ctrl.props, 'qos') }, children: [
                [0, 1, 2].map(function(el) {
                  return ({tag: "option", attrs: {value: Number(el) }, children: [ el ]});
                })
            ]}
          ]}, 

          {tag: "div", attrs: {class:"two columns"}, children: [
            {tag: "button", attrs: {class:"button-primary u-pull-right", type:"button", 
              onclick: ctrl.subscribe.bind(this, ctrl.props) }, children: [
              "Subscribe"
            ]}
          ]}
        ]}
      ]}
    );
  }
};

var SubscriptionList = {
  view : function(ctrl, app) {
    app = app.api;
    return (
      {tag: "table", attrs: {class: app.subscriptions.length ? 'u-full-width subscription-list' : 'u-full-width subscription-list u-hide'}, children: [
        {tag: "thead", attrs: {}, children: [
          {tag: "tr", attrs: {}, children: [
            {tag: "th", attrs: {}, children: ["Topic"]}, 
            {tag: "th", attrs: {}, children: ["QoS"]}, 
            {tag: "th", attrs: {}}
          ]}
        ]}, 
        {tag: "tbody", attrs: {}, children: [
          app.subscriptions.map(function(el) {          
            return ({tag: "tr", attrs: {}, children: [
                      {tag: "td", attrs: {}, children: [ el.topic]}, 
                      {tag: "td", attrs: {}, children: [ el.qos]}, 
                      {tag: "td", attrs: {}, children: [
                        {tag: "button", attrs: {class:"button", type:"button", 
                          onclick: app.unsubscribe.bind(this, el.topic) }, children: [
                          "Unsubscribe"
                        ]}
                      ]}
                    ]})
          })
        ]}
      ]}
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
      {tag: "form", attrs: {class:"publish-form", onSumbit:"event.preventDefault();"}, children: [
        {tag: "div", attrs: {class:"row"}, children: [
          {tag: "div", attrs: {class:"seven columns"}, children: [
            {tag: "label", attrs: {for:"pwdInput"}, children: ["Topic"]}, 
            {tag: "input", attrs: {class:"u-full-width", type:"text", id:"pwdInput", 
              value: ctrl.msg.topic, 
              onchange: m.setValue(ctrl.msg, 'topic') }}
          ]}, 

          {tag: "div", attrs: {class:"two columns"}, children: [
            {tag: "label", attrs: {for:"qosInput"}, children: ["QoS"]}, 
            {tag: "select", attrs: {class:"u-full-width", id:"qosInput", 
              onchange: m.setValue(ctrl.msg, 'qos') }, children: [
                [0, 1, 2].map(function(el) {
                  return ({tag: "option", attrs: {value: Number(el) }, children: [ el ]});
                })
            ]}
          ]}, 

          {tag: "div", attrs: {class:"one column"}, children: [
            {tag: "label", attrs: {for:"lwtRetainInput"}, children: ["Retain"]}, 
            {tag: "input", attrs: {type:"checkbox", id:"lwtRetainInput", 
              checked: ctrl.msg.retain, 
              onclick: m.setAttr(ctrl.msg, 'retain', 'checked') }}
          ]}, 

          {tag: "div", attrs: {class:"two columns"}, children: [
            {tag: "button", attrs: {class:"button-primary u-pull-right", type:"button", onclick: ctrl.publish.bind(this, ctrl.msg) }, children: ["Publish"]}
          ]}
        ]}, 

        {tag: "label", attrs: {for:"message"}, children: ["Message"]}, 
        {tag: "textarea", attrs: {class:"u-full-width", id:"message", 
          value: ctrl.msg.payload, 
          onchange: m.setValue(ctrl.msg, 'payload') }
        }
      ]}
    );
  },
};

var Messages = {
  view : function(ctrl, app) {
    app = app.api;
    return (
      {tag: "div", attrs: {}, children: [
        app.messages.map(function(msg) {
            return ({tag: "div", attrs: {}, children: [
                      {tag: "div", attrs: {class:"row"}, children: [
                        {tag: "div", attrs: {class:"eight columns"}, children: ["Topic: ",  msg.topic]}, 
                        {tag: "div", attrs: {class:"two columns"}, children: ["QoS: ",  msg.qos]}, 
                        {tag: "div", attrs: {class:"two columns"}, children: [ msg.retained ? 'Retained' : '']}
                      ]}, 
                      {tag: "pre", attrs: {}, children: [{tag: "code", attrs: {}, children: [ msg.payload]}]}
                    ]}
            );
        })
      ]}
    );    
  },
};
