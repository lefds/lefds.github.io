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

new (function() {
	var ext = this;
	
	// LS modification BEGIN
	// var client = new Messaging.Client("mqtt.flespi.io", 80, 123254);	
	
	
	//Attempting to use the jQuery library to load the MQTT client code ...
	//Unbelivable that this critical step is not reported anywhere!!!	
	$.getScript("http://lefds.github.io/extensions/paho-mqtt.js");
	
	//Inspiration: https://gist.github.com/jpwsutton/6427e38dd3d1db6ba11e48eb0712cba7 => example.js
	// Create a client instance
	//novo
	
	// client = new Paho.MQTT.Client("iot.eclipse.org", Number(443), "/wss");
	
	var client = new Paho.MQTT.Client("test.mosquitto.org", 8080, "myclientid_" + parseInt(Math.random() * 100, 10));
	
	client.startTrace();
	// set callback handlers
	client.onConnectionLost = onConnectionLost;
	client.onMessageArrived = onMessageArrived;

	// connect the client
	client.connect({onSuccess:onConnect,
					useSSL: true});
	console.log("attempting to connect...")
	
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
	  client.publish(message)
	  client.publish("/World", "Hello from a better publish call!", 1, false)

	  topicMessage = new Paho.MQTT.Message("This is a message where the topic is set by setTopic");
	  topicMessage.topic = "/World";
	  client.publish(topicMessage)
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
	
	//LS modeification END
	
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