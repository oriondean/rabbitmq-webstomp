(function() {

  var EchoClient = function() {

    this.username = 'yolo';
    this.password = 'swag';

    this.useSockJS = false;

    var webSocket = this.useSockJS ? new SockJS('http://SL-WS-109:15674/stomp') : new WebSocket('ws://SL-WS-109:15674/stomp/websocket');
    this.client = Stomp.over(webSocket);

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
          this.client.send('/exchange/test/echo', {'content-type':'text/plain'}, this.messageInput.val());
          this.messageInput.val('')
        }
      }.bind(this)
    });

    this.connect = function() {
      if(this.useSockJS) {
        // SockJS does not support heart-beat: disable heart-beats
        this.client.heartbeat.outgoing = 0;
        this.client.heartbeat.incoming = 0;
      }

      this.client.connect(this.username, this.password, this.onConnect.bind(this), this.onError.bind(this), '/');
    };

    this.onConnect = function() {
      // subscribe to the test queue on the echo exchange.
      this.client.subscribe("/exchange/test/echo", this.onMessageReceived.bind(this));
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