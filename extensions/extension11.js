//https://lefds.github.io/extensions/extension11.js
//http://savaka2.github.io/scratch-extensions-directory/
//Using: https://www.eclipse.org/paho/downloads.php
// More sources helping
//   - https://pt.slideshare.net/DarrenAdkinson/understanding-scratchx-extensions-with-javascript
// Tested with: http://www.hivemq.com/demos/websocket-client/ 
// Nota:Na extensão 
//    https://khanning.github.io/scratch-isstracker-extension/iss_extension.js
// usam um método que corre uma função de x em x milisegundos
// updateISSLocation();
//  var poller = setInterval(updateISSLocation, 2000);
// e no shutdow desligam a função



(function(ext) {
    // TODO: public repo + documentation + samples
    // GH pages	
	
	ws: true

	//Several global variables important to understand the extension status


	//Extension Status progress (reported over the green exttension led on the Scratch GUI)
	//  0/6: Fatal error (used to stop extension execution)
	//  1/6: SCAN DMX Extension being loaded
	//	2/6: MQTT: API Sucessfully loaded.
	//  3/6: MQTT: connection established & alive
	//  4/6: Lighting Server: on-line & waiting scratch cients
	//  5/6: Lighting Server: on-line, accepted our control request & waiting more scratch cients
	//  6/6: Lighting Server: on-line, accepting our control requests
	
	
	const FATAL_ERROR_STATUS = 0;
	const EXTENSION_LOADING_STATUS = 1;
	const MQTT_API_LOADED_STATUS = 2;
	const MQTT_CONNECTED_STATUS = 3;
	const LIGHTING_SERVER_ONLINE_STATUS = 4;
	const LIGHTING_SERVER_JOIN_STATUS = 5;
	const LIGHTING_SERVER_CONTROL_STATUS = 6;
	
	
	var ExtensionStatusValue = {
		0:0,
		1:2,
		2:2,
		3:2,
		4:2,
		5:2,
		6:2,
	}
		
	
	var ExtensionStatusReport = {
		0:"Fatal error (used to stop extension execution)!",
		1:"SCAN DMX Extension being loaded.",
		2:"MQTT: API Sucessfully loaded.",
		3:"MQTT: connection established & alive.",
		4:"Lighting Server: on-line & waiting scratch cients.",
		5:"Lighting Server: on-line, accepted our control request & waiting more scratch cients.",
		6:"Lighting Server: on-line, accepting our control requests."		
	};


	//Called by scratch two times per second	
	//Value	Color	Meaning
	//0		red		error
	//1		yellow	not ready
	//2		green	ready
	//=> IF a 0 or 1 is returned the Scratch simply stops the extension at all!
	//The _getStatus functions is immediattly and periodically called.
	//We can use a global message and variable to flag important events
	var Current_Extension_Status = EXTENSION_LOADING_STATUS;

	
	ext._getStatus = function() {
		//console.log("get status:<" + ExtensionStatusValue[Current_Extension_Status] + ">:" + "<" + ExtensionStatusReport[Current_Extension_Status] + ">:");
		return { status: ExtensionStatusValue[Current_Extension_Status], msg: ExtensionStatusReport[Current_Extension_Status]};
	};

	
	var MQTT_API_Loaded = false;
	
	var MQTT_Connection_Established = false;
		
	//MQTT handle to talk with the MQTT broker (Mosquitto - WebSocket protocol)
	var MQTT_Client = null;


	
	// ======================== MQTT Paho API Module stuff =======================================


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
			console.log("MQTT Java Script module sucessufuly loaded!");
			MQTT_API_Loaded  = true;
			Current_Extension_Status = MQTT_API_LOADED_STATUS;
		},
		error: function (jqXHR, textStatus, errorThrown) {
			console.log("Error while loading MQTT JavaScript API: <"+ textStatus + ">");
			Current_Extension_Status = FATAL_ERROR_STATUS; 
		},
	   dataType:'script'
	});	


	
	
	// ======================== MQTT Broker stuff =======================================

	
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
		Current_Extension_Status = MQTT_CONNECTED_STATUS;		
		MQTT_Connection_Established = true;
		  
		// Once a MQTT connection has been made, subcribe the topic that used by the Lihting server to flag it is ready.
		console.log("mqtt_success_onConnect: Subscribing the topic: " + LightingReadyTopic);
		MQTT_Client.subscribe(LightingReadyTopic);
	};


	var mqtt_failure_onConnect = function onConnectionFailure() {
		console.log("mqtt_failure_onConnect: Connection failue");
		Current_Extension_Status = MQTT_API_LOADED_STATUS;
		MQTT_Connection_Established = false;		
		MQTT_Client = null;
	};


	var mqtt_onConnectionLost = function onConnectionLost(responseObject) {
		console.log("mqtt_onConnectionLost: Connection lost with the MQTT broker <" + responseObject.errorMessage  +">");
		Current_Extension_Status = MQTT_API_LOADED_STATUS;
		MQTT_Connection_Established = false;		
		MQTT_Client = null;
	};
	
	var mqtt_onMessageArrived = function onMessageArrived(message) {
		  console.log("mqtt_onMessageArrived: MQTT Message Arrived: " + message.payloadString);
		  //by now we are assuming it is the "ready" topic the single one being published by the broker
		  Current_Extension_Status = LIGHTING_SERVER_JOIN_STATUS;		  
		  SACN_CameoFXBar_29CHMODE_Ready_Published = true;
	};	

  

	
	//Scratch extension blocks
	
	
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

	//Block: ConnectToMQTTBroker
	//Type: Report block that waits
	//Help: //https://github.com/LLK/scratchx/wiki#reporter-blocks-that-wait
	//Hints:
	//  - This block returns just when the callback function is called
	//Algorithm:
	//  - Disconnect from the current MQTT broker (if any)
	//  - Attempt to connect to the specified MQTT broker
	//  - Report connection status after a given milliseconds timeout
	
	const MQTT_CONNECTION_TIMEOUT = 2000;  // miliseconds
	
	ext.ConnectToMQTTBroker = function(mqtt_server, mqtt_port, callback) {
		console.log("ConnectToLightingController: Preparing to connect to the MQTT broker at " + mqtt_server + ":" +  mqtt_port);
		
		// Disconnect from the current MQTT broker (if any)
		if (MQTT_Client != null) {
			MQTT_Client.disconnect();	//Disconnect from a previous selected MQTT broker
			Current_Extension_Status = MQTT_API_LOADED_STATUS;
			MQTT_Connection_Established = false;
		}
		
		MQTT_Connection_Established = null;
		
		// Connect to the specified MQTT broker
		MQTT_Client = new Paho.MQTT.Client(mqtt_server, mqtt_port, MQTTClientID);
		console.log('ConnectToLightingController: New MQTT Client handle created ...');		
		MQTT_Client.onConnectionLost = mqtt_onConnectionLost;
		MQTT_Client.onMessageArrived = mqtt_onMessageArrived;
		console.log('ConnectToLightingController: Attemping to connect to the MQTT broker now ...');
		MQTT_Client.connect({onSuccess: mqtt_success_onConnect, onFailure: mqtt_failure_onConnect});
		console.log('ConnectToLightingController: Connection in course ...');

		window.setTimeout(function() {
            callback(MQTT_Connection_Established);
			return;
        }, MQTT_CONNECTION_TIMEOUT);		
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
		   //console.log("WaitLightingServerBecomesReady: Lighting server announces it is ready");
           return true;
       }
	   //console.log("WaitLightingServerBecomesReady: Lighting server not yet ready!");
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
		['R', 'Is the MQTT Broker at IP %s : %n ?', 'ConnectToMQTTBroker', '192.168.100.100', 9001],
		['h', 'When Lightning Controller is ready', 'WaitLightingServerBecomesReady']
		],
		url: 'https://lefds.github.io/extensions/index.html',
		displayName: 'sACN DMX Scratch Extension'
    };

    // Register the extension
    ScratchExtensions.register('sACN DMX Extension', descriptor, ext);

})({});