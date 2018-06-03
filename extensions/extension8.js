//https://lefds.github.io/extensions/extension8.js

(function(ext) {
    // TODO: public repo + documentation + samples
    // GH pages

	ws: true
	
	var client = null;
	
	//As a client ID I will use a random mumber to avoid collisions
	//When one client attempts to connect t the broker using the same ID another session is using
	//the first client session is terminated (by default).
	//An universe size of 100.000 must be enough to handle a class of 100 diferents student IDs
	var mqttClientID =  Math.floor(Math.random() * Math.floor(100000)) + ".SACN.ISEC.PT";
	
	var ajax_success_onConnect = function onConnect() {
		  // Once a MQTT connection has been made, make a subscription and send a message.
		  console.log("onConnect");
		  
		  message = new Paho.MQTT.Message("New Lighting programmer arrived ...");
		  console.log("MQTT:Announce a new lighting programmer arriving.");
		  
		  message.destinationName = "/DMX-Universe01";
		  console.log("MQTT:Choose the topic to publish it!");
		  
		  client.send(message);
		  console.log("MQTT:Publish the message");
	};
	

	var ajax_success_onConnectError = function  OnConnectError (invocationContext, errorCode, errorMessage) {
		console.log("onConnectAbort:" +invocationContext + " errorCode: " + errorCode + " errorMessage:" + errorMessage);
	};

	
	var ajax_onConnectionLost = function onConnectionLost(responseObject) {
		  console.log('MQTT:onConnectionLost');			
		  if (responseObject.errorCode !== 0)
			console.log("onConnectionLost:"+responseObject.errorMessage);
	};
			

	var ajax_onMessageArrived = function onMessageArrived(message) {
		  console.log('44');
		  console.log("onMessageArrived:" + message.payloadString);
		  client.disconnect();
	};

	
	console.log('Client ID = ' + mqttClientID);

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
				
		console.log('8');
        console.log('broadcast block');
        }
    };

	
	//BEGIN: As minhas extensões MQTT
	
	//O bloco de connect ao MQTT broker será o típico "reporter block that waits"
	//pois terá de se ligar mas também esperar e reportar (i.e. retornar) se correu bem ou mal a ligação 
	//https://github.com/LLK/scratchx/wiki#command-blocks-that-wait
		
	ext.mqtt_connect = function(mqtt_server, mqtt_port, connect_status_callback) {
		// Use AJAX to dynamically load the MQTT JavaScript Broker API (paho-mqtt.js)
		// Actually currently I'm hosting "paho-mqtt.js" on my own GitHub
		// https://github.com/eclipse/paho.mqtt.javascript/blob/master/src/paho-mqtt.js
		 
		// Documented at: http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
		//Esta linha vai chamar a função "jQuery.ajax( url [, settings ] )" ou seja 
		//Perform an asynchronous HTTP (Ajax) request.
		$.ajax({
			async:false,	//this may temporarely lock the browser but it is the price to pay ...
			type:'GET',
			url:'https://lefds.github.io/extensions/paho-mqtt.js',
			data:null,
			success: function(){
				client = new Paho.MQTT.Client(mqtt_server, mqtt_port, mqttClientID);
				console.log('MQTT Client handle created');
				client.onConnectionLost = ajax_onConnectionLost;	
				client.connect({onSuccess: ajax_success_onConnect},{onFailure: ajax_success_onConnectError});
				connect_status_callback(1);
			},
			
			error: function(){
				connect_status_callback(-1);
			},

		   dataType:'script'

		});		
	};
	

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
			['R', 'Connect to MQTT server %s on port %n', 'mqtt_connect', '192.168.100.100', 9001],
		],
		url: 'https://lefds.github.io/extensions/index.html',
		displayName: 'sACN DMX Scratch Extension'
    };

    // Register the extension
    ScratchExtensions.register('sACN DMX Extension', descriptor, ext);

})({});
