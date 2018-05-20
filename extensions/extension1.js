/*
 * source: http://savaka2.github.io/scratch-extensions-directory/extensions/calcublock.js
 * To open and run this Scratch extension:
 * 1) open the URL on a web browser: http://scratchx.org/#scratch
 * 2) Select the option: "Open Extension URL"
 * 3) Paste: https://lefds.github.io/extensions/extension.js
 * 4) Click "I understand and continue"
 * 5) A new black block "calculate [5+5]" must appear.
 *
 * A primeira tentaiva não funcionou: deu erro visivel na dev window "Uncaught SyntaxError: Unexpected token <"
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js" type="text/javascript"></script>
 *
 */
 
 
 
/*
Load a block from github.io.

Accepts a url as a parameter which can include url parameters e.g. https://megjlow.github.io/extension2.js?name=SUN&ip=10.0.0.1
*/

 
 
	// LS modification BEGIN
	// var client = new Messaging.Client("mqtt.flespi.io", 80, 123254);	
	
	
	//Attempting to use the jQuery library to load the MQTT client code ...
	//Unbelivable that this critical step is not reported anywhere!!!	
	//$.getScript("http://lefds.github.io/extensions/paho-mqtt.js");
	//$.getScript("https://raw.githubusercontent.com/eclipse/paho.mqtt.javascript/master/src/mqttws31.js");
	//$.getScript("ws://test.mosquitto.org:8080/mqtt");	
	//#Esta é a nova diferença
	
	console.log("Before attempting to load MQTT");
	
	//$.getScript("http://lefds.github.io/extensions/paho-mqtt.js");
	//$.getScript("ws://test.mosquitto.org:8080/mqtt");	
    /* Este é o erro para a maioria das fontes:
		extension.js:66 Uncaught ReferenceError: Paho is not defined
			at new <anonymous> (extension.js:66)
			at extension.js:22	
        A extensão é carrgada com um nome esquisito no final "?_=1526832485204" "https://lefds.github.io/extensions/paho-mqtt.js?_=1526832485204"
		Provavelmente é este nome que a torna inutilizável no scratch.
		Na consola de desenvolvimento na Tab Network são visivéis os .js carregados.
		O js mqtt aparece a vermelho com o status "caceled"
	*/
		
	//$.getScript("https://github.com/eclipse/paho.mqtt.javascript/blob/master/src/paho-mqtt.js");
	/* Este dá o erro que se deve à forma como o server envia o js
		Refused to execute script from 'https://github.com/eclipse/paho.mqtt.javascript/blob/master/src/paho-mqtt.js?_=1526831583707' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.
	*/

	//console.log("Before attempting to load MQTT");	
	//$.getScript("http://lefds.github.io/extensions/paho-mqtt.js");	
	//var wsbroker = "test.mosquitto.org";  //mqtt websocket enabled brokers
	//var wsport = 8080; // port for above
	//var client = new Client(wsbroker, wsport, "myclientid_" + parseInt(Math.random() * 100, 10));
	
	$.getScript("http://lefds.github.io/extensions/mqttws31.js");
	console.log("Before attempting to load MQTT  ....");
	//Using the HiveMQ public Broker, with a random client Id
	var client = new Messaging.Client("broker.mqttdashboard.com", 8000, "myclientid_" + parseInt(Math.random() * 100, 10));

	
	 //Gets  called if the websocket/mqtt connection gets disconnected for any reason
	 client.onConnectionLost = function (responseObject) {
		 //Depending on your scenario you could implement a reconnect logic here
		 alert("connection lost: " + responseObject.errorMessage);
	 };

	 //Gets called whenever you receive a message for your subscriptions
	 client.onMessageArrived = function (message) {
		 //Do something with the push message you received
		 $('#messages').append('<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>');
	 };

	 //Connect Options
	 var options = {
		 timeout: 3,
		 //Gets Called if the connection has sucessfully been established
		 onSuccess: function () {
			 alert("Connected");
		 },
		 //Gets Called if the connection could not be established
		 onFailure: function (message) {
			 alert("Connection failed: " + message.errorMessage);
		 }
	 };

	 //Creates a new Messaging.Message Object and sends it to the HiveMQ MQTT Broker
	 var publish = function (payload, topic, qos) {
		 //Send your message (also possible to serialize it as JSON or protobuf or just use a string, no limitations)
		 var message = new Messaging.Message(payload);
		 message.destinationName = topic;
		 message.qos = qos;
		 client.send(message);
	 }	
	
	console.log("Before attempting to load MQTT ...");	
   
	//$.getScript("http://www.hivemq.com/demos/websocket-client/js/mqttws31.js");	
	//Using the HiveMQ public Broker, with a random client Id
	//var client = new Messaging.Client("broker.mqttdashboard.com", 8000, "myclientid_" + parseInt(Math.random() * 100, 10));	
	//console.log("After connecting to load MQTT ... -----");	
	
    /*	
	var wsbroker = "test.mosquitto.org";  //mqtt websocket enabled brokers
    var wsport = 8080 // port for above
    var client = new Paho.MQTT.Client(wsbroker, wsport, "myclientid_" + parseInt(Math.random() * 100, 10));
			
    client = new Messaging.Client("broker.mqttdashboard.com", 8000, "clientId-TykTsdsdi");
	*/

	
/*	
	var wsbroker = "test.mosquitto.org";  //mqtt websocket enabled broker
	
	var wsport = 8080 // port for above

	var client = new Paho.MQTT.Client(wsbroker, wsport,
		"myclientid_" + parseInt(Math.random() * 100, 10));	
	
*/

	console.log("After loading MQTT");
	
	
	//Inspiration: https://gist.github.com/jpwsutton/6427e38dd3d1db6ba11e48eb0712cba7 => example.js
	// Create a client instance
	//novo ou nao
	
	// client = new Paho.MQTT.Client("iot.eclipse.org", Number(443), "/wss");
	
	console.log("Attempt to create a MQTT Client");
	
	//var client = new Paho.MQTT.Client("test.mosquitto.org", 8080, "myclientid_" + parseInt(Math.random() * 100, 10));
	
	//console.log("Create a MQTT Client");		
	//client.startTrace();
	// set callback handlers
	//client.onConnectionLost = onConnectionLost;
	//client.onMessageArrived = onMessageArrived;

	// connect the client
/*
	client.connect({onSuccess:onConnect,
					useSSL: true});
	console.log("attempting to connect...");
	
	// called when the client connects
	function onConnect() {
	  // Once a connection has been made, make a subscription and send a message.
	  console.log("onConnect");
	  client.subscribe("/World");
	  message = new Paho.MQTT.Message("Hello");
	  message.destinationName = "/World";
	  //client.send(message);
	//console.log(client.getTraceLog());

	  //client.getTraceLog().forEach(function(line){
	  //  console.log('Trace: ' + line)
	  //});
	  //newMessage = new Paho.MQTT.Message("Sent using synonyms!");
	  //newMessage.topic = "/World";
	  client.publish(message);
	  
	  client.publish("/World", "Hello from a better publish call!", 1, false);

	  topicMessage = new Paho.MQTT.Message("This is a message where the topic is set by setTopic");
	  topicMessage.topic = "/World";
	  client.publish(topicMessage);
	}

	// called when the client loses its connection
	function onConnectionLost(responseObject) {
	  if (responseObject.errorCode !== 0) {
		console.log("onConnectionLost:"+responseObject.errorMessage);
	  }
	}

	// called when a message arrives
	function onMessageArrived(message) {
	  console.log("onMessageArrived:"+message.payloadString);
	}
	
*/
	//LS modeification END
 


 
new (function() {
	
	var ext = this;
	
	
	var descriptor = {
    	blocks: [
      		[' ', 'Load extension block %s', 'loadBlock', 'url', 'url'],
    	],
    	url: 'http://www.warwick.ac.uk/tilesfortales'
  	};
  
  
  	ext._shutdown = function() {};
  
  
  	ext._getStatus = function() {
  		return {status: 2, msg: 'Device connected'}
  	};
  	
  	ext.loadBlock = function(url) {
  		ScratchExtensions.loadExternalJS(url);
  	};
  	
  	ScratchExtensions.register("extensionloader", descriptor, ext);
	
});

 
 
/*
 
(function(ext) {

 	
	ext._shutdown = function() {};
	ext._getStatus = function() {
		return {status: 2, msg: 'Ready'};
	};
	ext.eval = function(a) {
		return eval(a);
	};
	var descriptor = {
		blocks: [
			['r', 'calculate %s', 'eval', "5+5"],
		],
	};
	ScratchExtensions.register("CalcuBlock", descriptor, ext);
})({});

*/