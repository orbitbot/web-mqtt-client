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
      {tag: "form", attrs: {class:"connect-form"}, children: [
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
          value: ctrl.props.will.data, 
          onchange: m.setValue(ctrl.props.will, 'data') }
        }, 

        {tag: "button", attrs: {class:"button", type:"button", onclick: ctrl.clear}, children: ["Clear"]}
      ]}
    );
  },
}


var ConnectedWidget = {
  view : function(_, app) {
    return (
      {tag: "div", attrs: {}, children: [
        {tag: "div", attrs: {}, children: [
          {tag: "h6", attrs: {}, children: [ '... ' + app.clientId + '@' + app.host]}, 
          {tag: "button", attrs: {class:"button-primary u-pull-right", type:"button", onclick: app.disconnect}, children: ["Disconnect"]}
        ]}, 

        {tag: "h5", attrs: {}, children: ["Subscriptions"]}, 
        m.component(SubscriptionList, {data: app }), 
        m.component(SubscriptionForm, {api: app }), 

        {tag: "h5", attrs: {}, children: ["Publish"]}, 
        m.component(PublishForm, {api: app }), 

        {tag: "h5", attrs: {}, children: ["Messages"]}, 
        Messages
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
    this.subscribe = function(obj) {
      if (obj.topic)
        app.api.subscribe(obj);
    };
  },
  view : function(ctrl, app) {
    return (
      {tag: "form", attrs: {class:"subscribe-form"}, children: [
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
            {tag: "button", attrs: {class:"button-primary u-pull-right", type:"button", onclick: ctrl.subscribe.bind(this, ctrl.props) }, children: ["Subscribe"]}
          ]}
        ]}
      ]}
    );
  }
};

var SubscriptionList = {
  controller : function(app) {
    this.subscriptions = [
      { topic: 'some/topic', qos: 1 },
      { topic: 'another/topic', qos: 0 },
      { topic: 'third/topic', qos: 2 },
    ];
    this.unsubscribe = function() {
      console.log('unsubscribe ', arguments);
    }
  },
  view : function(ctrl, args) {
    return (
      {tag: "table", attrs: {class:"u-full-width subscription-list"}, children: [
        {tag: "thead", attrs: {}, children: [
          {tag: "tr", attrs: {}, children: [
            {tag: "th", attrs: {}, children: ["Topic"]}, 
            {tag: "th", attrs: {}, children: ["QoS"]}, 
            {tag: "th", attrs: {}}
          ]}
        ]}, 
        {tag: "tbody", attrs: {}, children: [
          ctrl.subscriptions.map(function(el) {          
            return ({tag: "tr", attrs: {}, children: [
                      {tag: "td", attrs: {}, children: [ el.topic]}, 
                      {tag: "td", attrs: {}, children: [ el.qos]}, 
                      {tag: "td", attrs: {}, children: [{tag: "button", attrs: {class:"button", type:"button", onclick: ctrl.unsubscribe.bind(this, el) }, children: ["Unsubscribe"]}]}
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
      message : ''
    };
  },
  view : function(ctrl, app) {
    return (
      {tag: "form", attrs: {class:"publish-form"}, children: [
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
            {tag: "button", attrs: {class:"button-primary u-pull-right", type:"button", onclick: app.api.publish.bind(this, ctrl.msg) }, children: ["Publish"]}
          ]}
        ]}, 

        {tag: "label", attrs: {for:"message"}, children: ["Message"]}, 
        {tag: "textarea", attrs: {class:"u-full-width", id:"message", 
          value: ctrl.msg.message, 
          onchange: m.setValue(ctrl.msg, 'message') }
        }
      ]}
    );
  },
};

var Messages = {
  controller : function(args) {
    this.messages = [
      { topic: 'some/topic'   , qos: 1, retained: true , message: 'something to write about a lorem like thing' },
      { topic: 'another/topic', qos: 0, retained: false, message: 'something to write about a lorem like thing' },
      { topic: 'third/topic'  , qos: 2, retained: true , message: 'something to write about a lorem like thing' },
    ];
  },
  view : function(ctrl, args) {
    return (
      {tag: "div", attrs: {}, children: [
        ctrl.messages.map(function(msg) {
            return ({tag: "div", attrs: {}, children: [
                      {tag: "div", attrs: {class:"row"}, children: [
                        {tag: "div", attrs: {class:"eight columns"}, children: ["Topic: ",  msg.topic]}, 
                        {tag: "div", attrs: {class:"two columns"}, children: ["QoS: ",  msg.qos]}, 
                        {tag: "div", attrs: {class:"two columns"}, children: [ msg.retained ? 'Retained' : '']}
                      ]}, 
                      {tag: "pre", attrs: {}, children: [{tag: "code", attrs: {}, children: [ msg.message]}]}
                    ]}
            );
        })
      ]}
    );    
  },
};
