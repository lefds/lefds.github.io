//https://lefds.github.io/extensions/extension10.js
//Using: https://www.eclipse.org/paho/downloads.php
// More sources helping
//   - https://pt.slideshare.net/DarrenAdkinson/understanding-scratchx-extensions-with-javascript
//
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
	
	var ajax_success_onConnect = function onConnect() {
		  // Once a MQTT connection has been made, subcribe the topic that used by the Lihting server to flag it is ready.
		  console.log("Subscribing the topic: " + LightigReadyTopic);
		  MQTT_Client.subscribe(LightigReadyTopic);
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
		  console.log("MQTT MessageArrived:" + message.payloadString);
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

	// Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
    
	
	//BEGIN: As minhas extensões MQTT
	
	//Hat block that an app shoul use to be notified that the Lightning equipment is ready
	var try_mqtt_connection = false;
	ext.WhenLightningController = function(mqtt_server, mqtt_port) {
		// Use AJAX to dynamically load the MQTT JavaScript Broker API (paho-mqtt.js)
		// Actually currently I'm hosting "paho-mqtt.js" on my own GitHub
		// https://github.com/eclipse/paho.mqtt.javascript/blob/master/src/paho-mqtt.js
		 
		// Documented at: http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
		// Not well documented anywhere.
		// The hat block code is running all the time on its own thread.
		// whenever it returns true the following blocks are executed but the hat block fucntion
		// remains being called. If the functions returns false the following blocks are not called. 		
		//console.log("WhenLightningController Hat block activated" + mqtt_server + ":" +  mqtt_port);
		
	    if (try_mqtt_connection === true) {
		   return false;
        }
		
	    try_mqtt_connection = true;

		MQTT_Client = new Paho.MQTT.Client(mqtt_server, mqtt_port, MQTTClientID);
		console.log('MQTT Client handle created');
		MQTT_Client.onConnectionLost = ajax_onConnectionLost;
		MQTT_Client.connect({onSuccess: ajax_success_onConnect, onFailure: ajax_success_onConnectError});
		console.log("Connection attempt in course ...");

		
		// Wait until the Lighting server flags that it is on-line and ready		
		while (!SACN_CameoFXBar_29CHMODE_Ready_Published) {
			console.log("Lighting server is still not online and ready");
			function Sleep(){} // Does nothing.
			setTimeout(Sleep, 5000); // Go to sleep for n milliseconds.								
		}
		
		if (SACN_CameoFXBar_29CHMODE_Ready_Published === true) {
			console.log("Lighting server is on-line and ready!");
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
		
		
		MQTT_Client.disconnect();
		return false;
	}



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
           return true;
       }
       return false;
    };

	
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
			['h', 'When Lightning Controller at IP %s : %n is ready', 'WhenLightningController', '192.168.100.100', 9001],			
            ['h', 'when alarm goes off', 'when_alarm'],
			['', 'run alarm after %n seconds', 'set_alarm', '10'],
		],
		url: 'https://lefds.github.io/extensions/index.html',
		displayName: 'sACN DMX Scratch Extension'
    };

    // Register the extension
    ScratchExtensions.register('sACN DMX Extension', descriptor, ext);

})({});
