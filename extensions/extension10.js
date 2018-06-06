//https://lefds.github.io/extensions/extension10.js

(function(ext) {
    // TODO: public repo + documentation + samples
    // GH pages

	ws: true

	//MQTT handle to talk with MQTT broker (Mosquitto)
	var MQTT_Client = null;

	//Flags when this Scratch client is notified that the Lighting robot (Cameo) is ready to be  controlled
	var SACN_CameoFXBar_29CHMODE_Ready_Published = false;
	
	//MQTT needs that every session is identified by a client ID. I will use a random mumber to avoid collisions
	//When one client attempts to connect to the broker using the same ID another session is using
	//the first client session is closed (by default).
	//An universe size of 100.000 must be enough to handle a class of 100 diferents student IDs
	var MQTTClientID =  Math.floor(Math.random() * Math.floor(100000)) + ".SACN.ISEC.PT";
	
	
	
	function init() {
		console.log("Estou no Init");
	}

	

	var ajax_success_onConnect = function onConnect() {
		  // Once a MQTT connection has been made, make a subscription and send a message.
		  console.log("onConnect");
		  MQTT_Client.subscribe("/SACN/CameoFXBar/29CHMODE/Ready");

		// Wait until a publish on the mentioned topic arrives
		if (SACN_CameoFXBar_29CHMODE_Ready_Published === true) {
		   return true;
		}
		return false;
		
		  /*
		  message = new Paho.MQTT.Message("New Lighting programmer arrived ...");
		  console.log("MQTT:Announce a new lighting programmer arriving.");
		  
		  message.destinationName = "/DMX-Universe01";
		  console.log("MQTT:Choose the topic to publish it!");
		  
		  MQTT_Client.send(message);
		  console.log("MQTT:Publish the message");
		  */
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
		  console.log("onMessageArrived:" + message.payloadString);
		  SACN_CameoFXBar_29CHMODE_Ready_Published = true;
		  MQTT_Client.disconnect();
	};

	
	console.log('Client ID = ' + MQTTClientID);

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
	
	ext.WhenLightningController = function(mqtt_server, mqtt_port) {
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
				MQTT_Client = new Paho.MQTT.Client(mqtt_server, mqtt_port, MQTTClientID);
				console.log('MQTT Client handle created');
				MQTT_Client.onConnectionLost = ajax_onConnectionLost;
				MQTT_Client.connect({onSuccess: ajax_success_onConnect, onFailure: ajax_success_onConnectError});				
			},
			
		   dataType:'script'

		});		
	};
			
		

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
			['h', 'When Lightning Controller at IP %s : %n is ready', 'WhenLightningController', '192.168.100.100', 9001],
		],
		url: 'https://lefds.github.io/extensions/index.html',
		displayName: 'sACN DMX Scratch Extension'
    };

    // Register the extension
    ScratchExtensions.register('sACN DMX Extension', descriptor, ext);

})({});
