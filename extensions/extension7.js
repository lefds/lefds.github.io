// https://lefds.github.io/extensions/extension7.js
// http://scratchx.org/
// http://www.hivemq.com/demos/websocket-client/
// http://www.steves-internet-guide.com/mqtt-hosting-brokers-and-servers/
// https://github.com/lefds/lefds.github.io/
// https://www.hivemq.com/blog/mqtt-essentials-part-4-mqtt-publish-subscribe-unsubscribe
// http://www.steves-internet-guide.com/install-mosquitto-linux/


//Moquitto installation on Ubuntu
//Source: http://www.steves-internet-guide.com/install-mosquitto-linux/
//sudo apt-add-repository ppa:mosquitto-dev/mosquitto-ppa
//sudo apt-get update
//sudo apt-get install mosquitto
// sudo apt-get install mosquitto-clients
// Depois de instalar é preciso alterara a configuração do server
// Configuração do servidor (MQTTT broker) que nos interessa
// "Websockets allows you to receive MQTT data directly into a web browser."
// Como fazer: http://www.steves-internet-guide.com/mqtt-websockets/ 
// Na verdade basta acrescentar ao ficheiro de configuração duas linhas: 
// sudo gedit /etc/mosquitto/mosquitto.conf&
// Eu acrescentei no final
// # lsantos@isec.pt added
//   listener 9001
//   protocol websockets
// depois foi apenas parar e arrancar o serviço 
// sudo /etc/init.d/mosquitto stop
// sudo /etc/init.d/mosquitto start
// Depois foi só testar através do cliente "http://www.hivemq.com/demos/websocket-client/"
// e obtive sucesso. a ligar-me.
// /usr/share/doc/mosquitto/examples/mosquitto.conf.example


(function(ext) {
    // TODO: public repo + documentation + samples
    // GH pages

	ws: true
	
	var client = null;
	
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

	
	var ajax_onConnectioLost = function onConnectionLost(responseObject) {
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
	//pois terá de se ligar mas também esperar e reportar se correu bem ou mal a ligação 
	//https://github.com/LLK/scratchx/wiki#command-blocks-that-wait
		
	ext.mqtt_connect = function(mqtt_server, mqtt_port, connect_status_callback) {
		// Use AJAX to load the MQTT JavaScript Broker API (paho-mqtt.js)
		// The "paho-mqtt.js" is hosted this time at my own GitHub but sourced from
		// https://github.com/eclipse/paho.mqtt.javascript/blob/master/src/paho-mqtt.js
		 
		// Documented at: http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings
		$.ajax({
			async:false,	//this may temporarely lock the browser but it is the price to pay ...
			type:'GET',
			url:'https://lefds.github.io/extensions/paho-mqtt.js',
			data:null,
			success: function(){
				client = new Paho.MQTT.Client(mqtt_server, mqtt_port, mqttClientID);
				console.log('MQTT Client handle created');
				
				client.connect({onSuccess: ajax_success_onConnect});
				console.log('MQTT sucessfully connected');
				connect_status_callback(-1);
			},
			
			error: function (){
				console.log('Client connection aborted ...');				
				connect_status_callback(1);
			},

		   dataType:'script'
		});
	};


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