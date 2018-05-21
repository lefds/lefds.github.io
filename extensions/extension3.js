//
//https://stackoverflow.com/questions/14031421/how-to-make-code-wait-while-calling-asynchronous-calls-like-ajax

(function(ext) {
    // TODO: public repo + documentation + samples
    // GH pages

	ws: true
	
    $.ajax({

        async:false,
		
        type:'GET',

        url:'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js',

        data:null,

        success: function(){
			client = new Paho.MQTT.Client('test.mosquitto.org', Number(80),11212313);
			console.log('MQTT Client handle obtained');
		},
		
	   dataType:'script'

    });
	
	
    //window['temp'] = 0; // init

	// Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
    
    ext.broadcast = function(name) {
        if (name.length > 0){ // blank broadcasts break firebase - not nice.
        //window['sent-' + name] = Math.random(); // HUGE thanks to the folks at White Mountain Science for fixing the multiple broadcast bug! (lines 32-40)

		console.log('2');
		
		function onConnect() {
		  // Once a connection has been made, make a subscription and send a message.
		  console.log("onConnect");
		  client.subscribe("/World");
		  message = new Paho.MQTT.Message("Hello");
		  message.destinationName = "/World";
		  client.send(message);
		};
		
		console.log('3');
		
		function onConnectionLost(responseObject) {
		  if (responseObject.errorCode !== 0)
			console.log("onConnectionLost:"+responseObject.errorMessage);
		};
		
		console.log('4');
		
		function onMessageArrived(message) {
		  console.log("onMessageArrived:"+message.payloadString);
		  client.disconnect();
		};
		
		console.log('4');
		client.onConnectionLost = onConnectionLost;
		
		console.log('5');
		client.onMessageArrived = onMessageArrived;
		
		console.log('6');
		client.connect({onSuccess:onConnect});
		
        console.log('broadcast block');
        }
    };
    
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            [' ', 'mesh broadcast %s', 'broadcast'],
        ],
        url: 'http://technoboy10.tk/mesh'
    };


    // Register the extension
    ScratchExtensions.register('Mesh', descriptor, ext);


	
    
})({});





