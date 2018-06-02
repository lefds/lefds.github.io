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
				
				client.connect({onSuccess: ajax_success_onConnect});
				connect_status_callback(1);
			},
			
			error: function(){
				connect_status_callback(-1);
			},

		   dataType:'script'

		});		
	};
	

//
 var output = '';
    var filler = '';
    var pop = '';
    var area = '';
    var request_option = '?fullText=true';
    var url_beginning = 'https://restcountries.eu/rest/v1/names/';

    ext.getInfo = function(option, country, callback) {
      var fullNameRequest = new XMLHttpRequest();
      fullNameRequest.onreadystatechange = function() {
        if (fullNameRequest.readyState === XMLHttpRequest.DONE) {
          var fullNameText = fullNameRequest.responseText;
          try {
            switch (option) {
              case 'Capital':      output = JSON.parse(fullNameText)[0].capital;         break;
              case 'Region':       output = JSON.parse(fullNameText)[0].region;          break;
              case 'Sub-Region':   output = JSON.parse(fullNameText)[0].subregion;       break;
              case 'Native Name':  output = JSON.parse(fullNameText)[0].nativeName;      break;
              case 'Calling Code': output = JSON.parse(fullNameText)[0].callingCodes[0]; break;
              case 'Population':   filler = ((JSON.parse(fullNameText)[0].population).toString()).split('');
                                    for (i=filler.length-3; i >0; i=i-3) { filler.splice(i, 0, ','); }
                                    for (i = 0; i < filler.length; i++) { output = output.concat(filler[i]); } break;
              case 'Area':         filler = ((JSON.parse(fullNameText)[0].area).toString()).split('');
                                    for (i=filler.length-3; i >0; i=i-3) { filler.splice(i, 0, ','); }
                                    for (i = 0; i < filler.length; i++) { output = output.concat(filler[i]); }
                                    output = output.concat(' sq. km'); break;
              case 'Population Density': pop = (JSON.parse(fullNameText)[0].population).toString();
                                    area = (JSON.parse(fullNameText)[0].area).toString();
                                    if (area === null || area == ' ' || area === '') {
                                      output = 'This country has no area.';
                                    }
                                    output = (Math.round((parseInt(pop)/parseInt(area)))).toString();
                                    output = output.concat(' people per sq. km'); break;
              case 'Main Language': filler = JSON.parse(fullNameText)[0].languages[0];
                                    switch (filler) {
                                      case 'ar': output = 'Arabic';     break;
                                      case 'bg': output = 'Bulgarian';  break;
                                      case 'ca': output = 'Catalan';    break;
                                      case 'zh': output = 'Chinese';    break;
                                      case 'hr': output = 'Croatian';   break;
                                      case 'cs': output = 'Czech';      break;
                                      case 'da': output = 'Danish';     break;
                                      case 'nl': output = 'Dutch';      break;
                                      case 'en': output = 'English';    break;
                                      case 'et': output = 'Estonian';   break;
                                      case 'fi': output = 'Finnish';    break;
                                      case 'fr': output = 'French';     break;
                                      case 'de': output = 'German';     break;
                                      case 'el': output = 'Greek';      break;
                                      case 'he': output = 'Hebrew';     break;
                                      case 'hi': output = 'Hindi';      break;
                                      case 'hu': output = 'Hungarian';  break;
                                      case 'is': output = 'Icelandic';  break;
                                      case 'id': output = 'Indonesian'; break;
                                      case 'it': output = 'Italian';    break;
                                      case 'ja': output = 'Japanese';   break;
                                      case 'ko': output = 'Korean';     break;
                                      case 'lv': output = 'Latvian';    break;
                                      case 'lt': output = 'Lithuanian'; break;
                                      case 'ms': output = 'Malay';      break;
                                      case 'no': output = 'Norwegian';  break;
                                      case 'fa': output = 'Persian';    break;
                                      case 'pl': output = 'Polish';     break;
                                      case 'pt': output = 'Portuguese'; break;
                                      case 'ro': output = 'Romanian';   break;
                                      case 'ru': output = 'Russian';    break;
                                      case 'sr': output = 'Serbian';    break;
                                      case 'sk': output = 'Slovak';     break;
                                      case 'sl': output = 'Slovenian';  break;
                                      case 'es': output = 'Spanish';    break;
                                      case 'sv': output = 'Swedish';    break;
                                      case 'th': output = 'Thai';       break;
                                      case 'tr': output = 'Turkish';    break;
                                      case 'uk': output = 'Ukrainian';  break;
                                      case 'ur': output = 'Urdu';       break;
                                      case 'vi': output = 'Vietnamese'; break;
                                      case 'ps': output = 'Pashto';     break;
                                      default: output = 'The language with the ISO Language Code \'' + filler +'.\'';
                                    } break;
            }
            if (output === '' || output == ' ') {
              output = 'This country has no ' + option + '.';
            }
            callback(output);
            output = '';
            filler = '';
          } catch (e) {
            var halfNameRequest = new XMLHttpRequest();
            halfNameRequest.onreadystatechange = function() {
              if (halfNameRequest.readyState === XMLHttpRequest.DONE) {
                var halfNameText = halfNameRequest.responseText;
                try {
                  switch (option) {
                    case 'Capital':      output = JSON.parse(halfNameText)[0].capital;         break;
                    case 'Region':       output = JSON.parse(halfNameText)[0].region;          break;
                    case 'Sub-Region':   output = JSON.parse(halfNameText)[0].subregion;       break;
                    case 'Native Name':  output = JSON.parse(halfNameText)[0].nativeName;      break;
                    case 'Calling Code': output = JSON.parse(halfNameText)[0].callingCodes[0]; break;
                    case 'Population':   filler = ((JSON.parse(halfNameText)[0].population).toString()).split('');
                                          for (i=filler.length-3; i >0; i=i-3) { filler.splice(i, 0, ','); }
                                          for (i = 0; i < filler.length; i++) { output = output.concat(filler[i]); } break;
                    case 'Area':         filler = ((JSON.parse(halfNameText)[0].area).toString()).split('');
                                          for (i=filler.length-3; i >0; i=i-3) { filler.splice(i, 0, ','); }
                                          for (i = 0; i < filler.length; i++) { output = output.concat(filler[i]); }
                                          output = output.concat(' sq. km'); break;
                    case 'Population Density': pop = (JSON.parse(halfNameText)[0].population).toString();
                                          area = (JSON.parse(halfNameText)[0].area).toString();
                                          output = (Math.round((parseInt(pop)/parseInt(area)))).toString();
                                          output = output.concat(' people per sq. km'); break;
                    case 'Main Language': filler = JSON.parse(halfNameText)[0].languages[0];
                                          switch (filler) {
                                            case 'ar': output = 'Arabic';     break;
                                            case 'bg': output = 'Bulgarian';  break;
                                            case 'ca': output = 'Catalan';    break;
                                            case 'zh': output = 'Chinese';    break;
                                            case 'hr': output = 'Croatian';   break;
                                            case 'cs': output = 'Czech';      break;
                                            case 'da': output = 'Danish';     break;
                                            case 'nl': output = 'Dutch';      break;
                                            case 'en': output = 'English';    break;
                                            case 'et': output = 'Estonian';   break;
                                            case 'fi': output = 'Finnish';    break;
                                            case 'fr': output = 'French';     break;
                                            case 'de': output = 'German';     break;
                                            case 'el': output = 'Greek';      break;
                                            case 'he': output = 'Hebrew';     break;
                                            case 'hi': output = 'Hindi';      break;
                                            case 'hu': output = 'Hungarian';  break;
                                            case 'is': output = 'Icelandic';  break;
                                            case 'id': output = 'Indonesian'; break;
                                            case 'it': output = 'Italian';    break;
                                            case 'ja': output = 'Japanese';   break;
                                            case 'ko': output = 'Korean';     break;
                                            case 'lv': output = 'Latvian';    break;
                                            case 'lt': output = 'Lithuanian'; break;
                                            case 'ms': output = 'Malay';      break;
                                            case 'no': output = 'Norwegian';  break;
                                            case 'fa': output = 'Persian';    break;
                                            case 'pl': output = 'Polish';     break;
                                            case 'pt': output = 'Portuguese'; break;
                                            case 'ro': output = 'Romanian';   break;
                                            case 'ru': output = 'Russian';    break;
                                            case 'sr': output = 'Serbian';    break;
                                            case 'sk': output = 'Slovak';     break;
                                            case 'sl': output = 'Slovenian';  break;
                                            case 'es': output = 'Spanish';    break;
                                            case 'sv': output = 'Swedish';    break;
                                            case 'th': output = 'Thai';       break;
                                            case 'tr': output = 'Turkish';    break;
                                            case 'uk': output = 'Ukrainian';  break;
                                            case 'ur': output = 'Urdu';       break;
                                            case 'vi': output = 'Vietnamese'; break;
                                            case 'ps': output = 'Pashto';     break;
                                            default: output = 'The language with the ISO Language Code \'' + filler +'.\'';
                                          } break;
                    }
                  if (output === '' || output == ' ') {
                    output = 'This country has no ' + option + '.';
                  }
                } catch (e) {
                  output = 'Please choose a real country.';
                }
                callback(output);
                output = '';
                filler = '';
              }
            };
            halfNameRequest.open("GET", url_beginning + country);
            halfNameRequest.send();
          }
        }
      };
      fullNameRequest.open("GET", url_beginning + country + request_option);
      fullNameRequest.send();
    };

//	
	
    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            [' ', 'mesh broadcast %s', 'broadcast'],
			['R', 'Connect to MQTT server %s on port %n', 'mqtt_connect', '192.168.100.100', 9001],
			['R', '%m.option_input of %s', 'getInfo', 'Capital', 'Afghanistan']
		],
        menus: {
          option_input: ['Area', 'Calling Code', 'Capital', 'Main Language', 'Native Name', 'Population', 'Population Density', 'Region', 'Sub-Region']
        },			
			
        //],
		url: 'https://lefds.github.io/extensions/index.html',
		displayName: 'sACN DMX Scratch Extension'
    };


    // Register the extension
    ScratchExtensions.register('sACN DMX Extension', descriptor, ext);


})({});
