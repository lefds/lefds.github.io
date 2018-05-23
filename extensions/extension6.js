//https://lefds.github.io/extensions/extension6.js
//https://stackoverflow.com/questions/14031421/how-to-make-code-wait-while-calling-asynchronous-calls-like-ajax



(function(ext) {
    // TODO: public repo + documentation + samples
    // GH pages

	ws: true
	
	var client;
	
	ext.ajax_success_onconnect = function onConnect() {
			  console.log('22');
			  // Once a connection has been made, make a subscription and send a message.
			  console.log("onConnect");
			  client.subscribe("/World");
			  message = new Paho.MQTT.Message("Hello");
			  message.destinationName = "/World";
			  client.send(message);
			};
	
    $.ajax({

        async:false,
		
        type:'GET',

		url:'https://lefds.github.io/extensions/paho-mqtt.js',
		
        data:null,

        success: function(){
			client = new Paho.MQTT.Client('test.mosquitto.org', Number(8080),"LSSANTOS112123132");
			console.log('MQTT Client handle obtained');
			
			console.log('2'); 		
/*			
			function onConnect() {
			  console.log('22');
			  // Once a connection has been made, make a subscription and send a message.
			  console.log("onConnect");
			  client.subscribe("/World");
			  message = new Paho.MQTT.Message("Hello");
			  message.destinationName = "/World";
			  client.send(message);
			};
*/
			console.log('7');
			client.connect({onSuccess:ajax_success_onconnect});
			
			console.log('3');
			
			function onConnectionLost(responseObject) {
			  console.log('33');			
			  if (responseObject.errorCode !== 0)
				console.log("onConnectionLost:"+responseObject.errorMessage);
			};
			
			console.log('5');
			client.onConnectionLost = onConnectionLost;
			
			console.log('4');
			
			function onMessageArrived(message) {
			  console.log('44');
			  console.log("onMessageArrived:"+message.payloadString);
			  client.disconnect();
			};
			
			
			console.log('6');
			client.onMessageArrived = onMessageArrived;
		
		},
		
	   dataType:'script'

    });
	
	
    //window['temp'] = 0; // init
	console.log('0');

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

/*	
	ext.mqtt_connect = function(mqtt_server, mqtt_port, connect_status) {
        // Make an AJAX call to the Open Weather Maps API
        $.ajax({
              url: 'http://api.openweathermap.org/data/2.5/weather?q='+location+'&units=imperial',
              dataType: 'jsonp',
              success: function( weather_data ) {
                  // Got the data - parse it and return the temperature
                  temperature = weather_data['main']['temp'];
                  connect_status(temperature);
              }
        });
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





