  (function() {

  var EchoClient = function() {

    // connection variables
    this.username = 'guest';
    this.password = 'guest';
    this.host = 'localhost';
    this.virtualHost = '/';

    // subscription variables
    this.exchange = 'test';
    this.routingKey = 'echo';
    this.subscriptionPath = '/exchange/' + this.exchange + '/' + this.routingKey;

    // configuration options
    this.useSockJS = false;
    this.secure = false;

    var port = this.secure ? '15671' : '15674',
        httpProtocol = this.secure ? 'https' : 'http',
        websocketProtocol = this.secure ? 'wss' : 'ws',
        websocket;

    if(this.useSockJS) {
      websocket = new SockJS(httpProtocol + '://' + this.host + ':' + port + '/stomp')
    } else {
      websocket = new WebSocket(websocketProtocol + '://' + this.host + ':' + port + '/stomp/websocket');
    }

    this.client = Stomp.over(websocket);

    this.messageInput = $('.message-input');
    this.log = $('.log-panel .log');

    this.messageInput.on({
      focus: function() {
        this.messageInput.val('');
      }.bind(this),
      keydown: function(event) {
        if(event.which === 13 && this.messageInput.val()) { // Enter key pressed
          // For SEND frames, a destination of the form /exchange/<name>[/<routing-key>] can be used.
          // This destination: sends to exchange <name> with the routing key <routing-key>.
          this.client.send(this.subscriptionPath,  {'content-type':'text/plain'}, this.messageInput.val());
          this.messageInput.val('')
        }
      }.bind(this)
    });

    this.connect = function() {

      this.client.heartbeat.outgoing = 30000;
      // SockJS does not support server --> client heartbeats
      this.client.heartbeat.incoming = 0;

      this.client.connect(this.username, this.password, this.onConnect.bind(this), this.onError.bind(this), this.virtualHost);
    };

    this.onConnect = function() {
      // subscribe to the test queue on the echo exchange.
      this.client.subscribe(this.subscriptionPath, this.onMessageReceived.bind(this));
    };

    this.onError = function() {
      console.log('connection error!');
    };

    this.onMessageReceived = function(message) {
      this.log.val(this.log.val() + '\n' + message.body);
    };

  };

  var client = new EchoClient();
  client.connect();

}());