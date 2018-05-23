//https://lefds.github.io/extensions/extension7.js

(function(ext) {
    // TODO: public repo + documentation + samples
    // GH pages

	ws: true
	
	var client = null;
	
	//An universe size of 100.000 must be enough to handle a class of 100 diferents student IDs :-)
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
			
	var ajax_onConnectioLost = function onConnectionLost(responseObject) {
			  console.log('MQTT:onConnectionLost');			
			  if (responseObject.errorCode !== 0)
				console.log("onConnectionLost:"+responseObject.errorMessage);
			};
			

	var ajax_onMessageArrived = function onMessageArrived(message) {
			  console.log('44');
			  console.log("onMessageArrived:"+message.payloadString);
			  client.disconnect();
			};

/*			
    $.ajax({

        async:false,
		
        type:'GET',

		url:'https://lefds.github.io/extensions/paho-mqtt.js',
		
        data:null,

        success: function(){
			client = new Paho.MQTT.Client('test.mosquitto.org', Number(8080),"LSSANTOS112123132");
			console.log('MQTT Client handle obtained');
			
			console.log('2'); 		
			console.log('7');
			
			client.connect({onSuccess:ajax_success_onConnect});
			
			console.log('3');
			
			
			console.log('5');
			client.onConnectionLost = ajax_onConnectioLost;
			
			console.log('4');
			
			
			
			console.log('6');
			client.onMessageArrived = ajax_onMessageArrived;
		
		},
		
	   dataType:'script'

    });
	
*/ //AJAX initial code
	
    //window['temp'] = 0; // init
	console.log('Client ID = ' + clientID);

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
	
	//O bloco de connects será o típico "reporter block that waits"
	//pois terá que ligar-se mas também indicar se correu bem ou mal a ligação 
	//https://github.com/LLK/scratchx/wiki#command-blocks-that-wait
	
	//END: As minhas extensões MQTT

	
	ext.mqtt_connect = function(mqtt_server, mqtt_port, connect_status_callback) {
		// Use AJAX to load the MQTT JavaScript Broker API (paho-mqtt.js)
		// The "paho-mqtt.js" is hosted this time at my own GitHub but sourced from
		// https://github.com/eclipse/paho.mqtt.javascript/blob/master/src/paho-mqtt.js
		 
		// Documented at: http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
		$.ajax({
			async:false,	//it may temporarely lock the browser but it is the price to pay ...
			type:'GET',
			url:'https://lefds.github.io/extensions/paho-mqtt.js',
			data:null,
			success: function(){
				client = new Paho.MQTT.Client(mqtt_server, mqtt_port, mqttClientID);
				console.log('MQTT Client handle created');
				
				client.connect({onSuccess: ajax_success_onConnect});
				connect_status_callback(1);
				console.log('Client connection succeded ...');
				
/*				
				console.log('5');
				client.onConnectionLost = ajax_onConnectioLost;
				
				console.log('4');
				
				
				
				console.log('6');
				client.onMessageArrived = ajax_onMessageArrived;
*/			
			},
			
			error: function (){
				connect_status_callback(-1);
				console.log('Client connection aborted ...');
			}
			
		   dataType:'script'

		});
		
		
		
		
		//
		
		
		
		
    };
*/    
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            [' ', 'mesh broadcast %s', 'broadcast'],
			['R', 'Connect to MQTT server %s on port %n', 'mqtt_connect', 'test.mosquitto.org', 8080],
        ],
        url: 'http://technoboy10.tk/mesh'
    };


    // Register the extension
    ScratchExtensions.register('Mesh', descriptor, ext);


	
    
})({});





