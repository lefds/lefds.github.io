(function(ext) {
    // TODO: public repo + documentation + samples
    // GH pages
	
	GlobalFlag = false;
	
	var client;
	
	function waitFunc() {
			if (!GlobalFlag) {
				setTimeout(waitFunc, 100);
			}
	}

	setTimeout(waitFunc, 100);
	
	
    $.ajax({

        async:false,
		
        type:'GET',

        url:'https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js',

        data:null,

        success: function(){
			client = new Paho.MQTT.Client('broker.hivemq.com', Number(1883), 'LSANTOS');
			GlobalFlag = true;
			console.log('Ajax function Performed');
		},
		
	   dataType:'script'

    });
	
	
	console.log("Timeout libertado");
    window['temp'] = 0; // init
	//Vou assumir que é aqui que tem lugar o código de inicialização

	function onConnect() {
	  // Once a connection has been made, make a subscription and send a message.
	  console.log("onConnect");
	  client.subscribe("/World");
	  message = new Paho.MQTT.Message("Hello");
	  message.destinationName = "/World";
	  client.send(message);
	};
	
	function onConnectionLost(responseObject) {
	  if (responseObject.errorCode !== 0)
		console.log("onConnectionLost:"+responseObject.errorMessage);
	};
	
	function onMessageArrived(message) {
	  console.log("onMessageArrived:"+message.payloadString);
	  client.disconnect();
	};
	
	
	client.onConnectionLost = onConnectionLost;
	client.onMessageArrived = onMessageArrived;
	client.connect({onSuccess:onConnect});

	
    
    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
    
    ext.broadcast = function(name) {
        if (name.length > 0){ // blank broadcasts break firebase - not nice.
        window['sent-' + name] = Math.random(); // HUGE thanks to the folks at White Mountain Science for fixing the multiple broadcast bug! (lines 32-40)
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





