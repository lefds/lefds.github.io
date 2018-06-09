//https://lefds.github.io/extensions/extension11.js
//Using: https://www.eclipse.org/paho/downloads.php
// More sources helping
//   - https://pt.slideshare.net/DarrenAdkinson/understanding-scratchx-extensions-with-javascript
// Tested with: http://www.hivemq.com/demos/websocket-client/ 
//


(function(ext) {
    // TODO: public repo + documentation + samples
    // GH pages

	ws: true

	//MQTT handle to talk with MQTT broker (Mosquitto)
	var MQTT_Client = null;
	
	var connected = false;

	//Flags when this Scratch client is notified that the Lighting robot (Cameo) is ready to be  controlled
	var SACN_CameoFXBar_29CHMODE_Ready_Published = false;
	
	//MQTT needs that every session is identified by a client ID. I will use a random mumber to avoid collisions
	//When one client attempts to connect to the broker using the same ID another session is using
	//the first client session is closed (by default).
	//An universe size of 100.000 must be enough to handle a class of 100 diferents student IDs
	var MQTTClientID =  Math.floor(Math.random() * Math.floor(100000)) + ".SACN.ISEC.PT";
	
	var LightigReadyTopic = "/SACN/CameoFXBar/29CHMODE/Ready";


	// Cleanup function when the extension is unloaded
    ext._shutdown = function() {
		if(MQTT_Client !== null) {
			MQTT_Client.disconnect();
		}
	};

	
	var ajax_success_onConnect = function onConnect() {
		  // Once a MQTT connection has been made, subcribe the topic that used by the Lihting server to flag it is ready.
		  console.log("Subscribing the topic: " + LightigReadyTopic);
		  MQTT_Client.subscribe(LightigReadyTopic);
	};
	

	var ajax_success_onConnectError = function  OnConnectError (invocationContext, errorCode, errorMessage) {
		console.log("onConnectAbort:" +invocationContext + " errorCode: " + errorCode + " errorMessage:" + errorMessage);
	};

	
	var mqtt_onConnectionLost = function onConnectionLost(responseObject) {
		  console.log('MQTT:onConnectionLost');			
		  if (responseObject.errorCode !== 0)
			console.log("MQTT Connection Lost:"+responseObject.errorMessage);
	};

	var mqtt_onMessageArrived = function onMessageArrived(message) {
		  console.log("MQTT Message Arrived: " + message.payloadString);
		  //by now we are assuming it the "ready" topic is being published
		  SACN_CameoFXBar_29CHMODE_Ready_Published = true;
	};

	
	
	//Code Execution begins here when the extension javascript file is loaded at http://scratchx.org/#
	console.log('Client ID = ' + MQTTClientID);

	ext._getStatus = function() {
		console.log("_getStatus being called");
		if (!connected)
			return { status:1, msg:'Disconnected' };
		else
		return { status:2, msg:'Connected' };
	};
	
	//Perform an asynchronous HTTP (Ajax) request.
	$.ajax({
		async:false,	//this may temporarely lock the browser but it is the price to pay ...
		type:'GET',
		url:'https://lefds.github.io/extensions/paho-mqtt.js',
		data:null,
		success: function(){
			connected = true;
			console.log("MQTT Java Script module sucessufuly loaded!");
		},
		
	   dataType:'script'
	});	

	
    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
    
	
	//BEGIN: As minhas extensões MQTT
	
	
	//Hat block that a scratch app should use to be notified that the Lightning equipment is ready
	var try_mqtt_connection = true;
	
	
	ext.WhenLightningController = async function(mqtt_server, mqtt_port) {
		
	//ext.WhenLightningController = function() {
		// Use AJAX to dynamically load the MQTT JavaScript Broker API (paho-mqtt.js)
		// Actually currently I'm hosting "paho-mqtt.js" on my own GitHub
		// https://github.com/eclipse/paho.mqtt.javascript/blob/master/src/paho-mqtt.js
		 
		// Documented at: http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
		// Not well documented anywhere.
		// The hat block code is running all the time on its own thread.
		// whenever it returns true the following blocks are executed but the hat block fucntion
		// remains being called. If the functions returns false the following blocks are not called. 		
		//console.log("WhenLightningController Hat block activated" + mqtt_server + ":" +  mqtt_port);
		
	    if (try_mqtt_connection === false) {
			try_mqtt_connection = false;
			return true;
		}
		return false;
	}
/*		
	    try_mqtt_connection = true;

		MQTT_Client = new Paho.MQTT.Client(mqtt_server, mqtt_port, MQTTClientID);
		console.log('MQTT Client handle created');
		MQTT_Client.onConnectionLost = mqtt_onConnectionLost;
		MQTT_Client.onMessageArrived = mqtt_onMessageArrived;

		
		MQTT_Client.connect({onSuccess: ajax_success_onConnect, onFailure: ajax_success_onConnectError});
		console.log("Connection attempt in course ...");

		
		//https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
		function sleep(ms) {
		  return new Promise(resolve => setTimeout(resolve, ms));
		}
		
		// Wait until the Lighting server flags that it is on-line and ready		
		while (!SACN_CameoFXBar_29CHMODE_Ready_Published) {
			console.log("Lighting server is still not online and ready");
			await sleep(1000);
		}
		
		console.log("WhenLightningController returning true");
		return true;
		

/*
		  message = new Paho.MQTT.Message("New Lighting programmer arrived ...");
		  console.log("MQTT:Announce a new lighting programmer arriving.");
		  
		  message.destinationName = "/DMX-Universe01";
		  console.log("MQTT:Choose the topic to publish it!");
		  
		  MQTT_Client.send(message);
		  console.log("MQTT:Publish the message");

		
		MQTT_Client.disconnect();
*/
/*		
	}
*/


//Example to be removed but that helps understangin that hat blocks are continously beeing called!



//source: https://github.com/LLK/scratchx/wiki#hat-blocks
	var alarm_went_off = false; // This becomes true after the alarm goes off
	
	ext.set_alarm = function(time) {
       window.setTimeout(function() {
           alarm_went_off = true;
       }, time*1000);
    };

    ext.when_alarm = function() {
       // Reset alarm_went_off if it is true, and return true
       // otherwise, return false.
	   console.log("When_alarm beeing called");
       if (alarm_went_off === true) {
           alarm_went_off = false;
		   console.log("Alarm went off!");
           return true;
       }
	   console.log("Alarm not went off yet!");
       return false;
    };

	
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
			['h', 'When Lightning Controller at IP %s : %n is ready', 'WhenLightningController1', '192.168.100.100', 9001],
//			['h', 'When Lightning Controller is ready', 'WhenLightningController'],
            ['h', 'when alarm goes off', 'when_alarm'],
			['', 'run alarm after %n seconds', 'set_alarm', '10'],
		],
		url: 'https://lefds.github.io/extensions/index.html',
		displayName: 'sACN DMX Scratch Extension'
    };

    // Register the extension
    ScratchExtensions.register('sACN DMX Extension', descriptor, ext);

})({});