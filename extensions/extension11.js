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

	// ======================== MQTT Paho API Module stuff =======================================
	var MQTT_API_Loaded = false;	

	//Perform an asynchronous HTTP (Ajax) request.
	// Use AJAX to dynamically load the MQTT JavaScript Broker API (paho-mqtt.js)
	// Actually currently I'm hosting "paho-mqtt.js" on my own GitHub
	// https://github.com/eclipse/paho.mqtt.javascript/blob/master/src/paho-mqtt.js	 
	// Documented at: http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings	
	$.ajax({
		async:false,	//this may temporarely lock the browser but it is the price to pay ...
		type:'GET',
		url:'https://lefds.github.io/extensions/paho-mqtt.js',
		data:null,
		success: function(){
			MQTT_API_Loaded  = true;
			console.log("MQTT Java Script module sucessufuly loaded!");
		},
		
	   dataType:'script'
	});	

	
	ext._getStatus = function() {
		console.log("_getStatus being called");
		if (!MQTT_API_Loaded)
			return { status:1, msg:'MQTT API loaded.' };
		else
		return { status:2, msg:'Unbale to load the MQTT API!'};
	};


	
	
	// ======================== MQTT Broker stuff =======================================

	//MQTT handle to talk with the MQTT broker (Mosquitto - WebSocket protocol)
	var MQTT_Client = null;
	
	//MQTT Topic used by the Lighting server to flag it is ready
	var LightingReadyTopic = "/SACN/CameoFXBar/29CHMODE/Ready";
	
	//Flags when this Scratch client is notified that the Lighting robot (Cameo) is ready to be  controlled
	var SACN_CameoFXBar_29CHMODE_Ready_Published = false;
	
	//MQTT needs that every session is identified by a client ID. I will use a random mumber to avoid collisions
	//When one client attempts to connect to the broker using the same ID another session is using
	//the first client session is closed (by default).
	//An universe size of 100.000 must be enough to handle a class of 100 diferents student IDs
	var MQTTClientID =  Math.floor(Math.random() * Math.floor(100000)) + ".SACN.ISEC.PT";
	console.log('Client ID = ' + MQTTClientID);
	

	// Cleanup function when the extension is unloaded
    ext._shutdown = function() {
		if(MQTT_Client !== null) {
			MQTT_Client.disconnect();
		}
	};


	var mqtt_success_onConnect = function onConnect() {
		  console.log("mqtt_success_onConnect: The MQTT broker is online.");
		  // Once a MQTT connection has been made, subcribe the topic that used by the Lihting server to flag it is ready.
		  console.log("mqtt_success_onConnect: Subscribing the topic: " + LightingReadyTopic);
		  MQTT_Client.subscribe(LightingReadyTopic);
	};


	var mqtt_onConnectionLost = function onConnectionLost(responseObject) {
		  console.log("mqtt_onConnectionLost: Connection lost with the MQTT broker");
		  MQTT_Client = null;
		  if (responseObject.errorCode !== 0)
			console.log("MQTT Connection Lost:"+responseObject.errorMessage);
	};

	var mqtt_onMessageArrived = function onMessageArrived(message) {
		  console.log("mqtt_onMessageArrived: MQTT Message Arrived: " + message.payloadString);
		  //by now we are assuming it is the "ready" topic the single one being published by the broker
		  SACN_CameoFXBar_29CHMODE_Ready_Published = true;
	};	

  
  
	
	//BEGIN: Extensões Scratch para dialogar com o MQTT	Broker
	
	
	//https://github.com/LLK/scratchx/wiki#reporter-blocks-that-wait
		/* Example	
		ext.get_temp = function(location, callback) {
			// Make an AJAX call to the Open Weather Maps API
			$.ajax({
				  url: 'http://api.openweathermap.org/data/2.5/weather?q='+location+'&units=imperial',
				  dataType: 'jsonp',
				  success: function( weather_data ) {
					  // Got the data - parse it and return the temperature
					  temperature = weather_data['main']['temp'];
					  callback(temperature);
				  }
			});
		};
		*/

	//Block: ConnectToLightingController
	//Scratch extension type: Report block that waits
	//Example: https://github.com/LLK/scratchx/wiki#reporter-blocks-that-wait
	//Neste módulo apenas quando a função callback é chamada o bloco termina a sua execução
	//Na nossa situação ligamo-nos ao broker MQTT e esperamos até ter um publish do Lihting server e informar que está pronto
	ext.ConnectToLightingController = function(mqtt_server, mqtt_port, callback) {
		console.log("ConnectToLightingController: Preparing to connect to the MQTT broker at " + mqtt_server + ":" +  mqtt_port);
		if (MQTT_Client != null) MQTT_Client.disconnect();		
		MQTT_Client = new Paho.MQTT.Client(mqtt_server, mqtt_port, MQTTClientID);
		console.log('ConnectToLightingController: New MQTT Client handle created ...');
		MQTT_Client.onConnectionLost = mqtt_onConnectionLost;
		MQTT_Client.onMessageArrived = mqtt_onMessageArrived;
		console.log('ConnectToLightingController: Attemping to connect to the MQTT broker now ...');
		MQTT_Client.connect({onSuccess: mqtt_success_onConnect, onFailure: mqtt_success_onConnectError});
		console.log('ConnectToLightingController: Connection in course ...');

		if (MQTT_Client === null) {
			console.log("ConnectToLightingController: MQTT broker not found ...");
			callback(false);
		}
		console.log("ConnectToLightingController: MQTT broker found ...");
		callback (true);
	}
		

	//Hat block that flags a ready Lighting Server
	// Not well documented anywhere.
	// The hat block code is running all the time on its own thread.
	// whenever it returns true the following blocks are executed but the hat block fucntion
	// remains being called. If the functions returns false the following blocks are not called. 		

	var lighting_server_announces_ready = false;
	
	ext.WaitLightingServerBecomesReady = function() {
	   lighting_server_announces_ready = SACN_CameoFXBar_29CHMODE_Ready_Published;
	   
       if (lighting_server_announces_ready === true) {
           lighting_server_announces_ready = false;		  
		   console.log("WaitLightingServerBecomesReady: Lighting server announces it is ready");
           return true;
       }
	   console.log("WaitLightingServerBecomesReady: Lighting server not yet ready!");
       return false;
    };
		
		/*		
	    if (when_mqtt_connected === true) {
			when_mqtt_connection = false;			
			//Tenta ligar

			
			

			
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
	
	
	
	
	//Hat block that flags a ready Lightning Server
	// Not well documented anywhere.
	// The hat block code is running all the time on its own thread.
	// whenever it returns true the following blocks are executed but the hat block fucntion
	// remains being called. If the functions returns false the following blocks are not called. 		
	
	var lighting_server_announces_ready = false;
	var lighting_server_ready = true;
			
	ext.WaitLightingServerBecomesReady = function() {
       if (lighting_server_announces_ready === true) {
           lighting_server_announces_ready = false;
		   lighting_server_ready  = true;
		   console.log("Lighting server announces it is ready");
           return true;
       }
	   console.log("Lighting server not yet ready!");
       return false;
    };


	
	//ext.WhenLightningController1 = function(mqtt_server, mqtt_port) {
		
		// Use AJAX to dynamically load the MQTT JavaScript Broker API (paho-mqtt.js)
		// Actually currently I'm hosting "paho-mqtt.js" on my own GitHub
		// https://github.com/eclipse/paho.mqtt.javascript/blob/master/src/paho-mqtt.js
		 
		// Documented at: http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
		// Not well documented anywhere.
		// The hat block code is running all the time on its own thread.
		// whenever it returns true the following blocks are executed but the hat block fucntion
		// remains being called. If the functions returns false the following blocks are not called. 		
		//console.log("WhenLightningController Hat block activated" + mqtt_server + ":" +  mqtt_port);

		/*		
	    if (when_mqtt_connected === true) {
			when_mqtt_connection = false;			
			//Tenta ligar
			MQTT_Client = new Paho.MQTT.Client(mqtt_server, mqtt_port, MQTTClientID);
			console.log('MQTT Client handle created');
			MQTT_Client.onConnectionLost = mqtt_onConnectionLost;
			MQTT_Client.onMessageArrived = mqtt_onMessageArrived;

			
			MQTT_Client.connect({onSuccess: mqtt_success_onConnect, onFailure: mqtt_success_onConnectError});
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

	

	
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
			['R', 'Connect to the Lighting Controller at IP %s : %n is ready', 'ConnectToLightingController', '192.168.100.100', 9001],
			['h', 'When Lightning Controller is ready', 'WaitLightingServerBecomesReady'],
		],
		url: 'https://lefds.github.io/extensions/index.html',
		displayName: 'sACN DMX Scratch Extension'
    };

    // Register the extension
    ScratchExtensions.register('sACN DMX Extension', descriptor, ext);

})({});