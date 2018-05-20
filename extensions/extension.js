/*
 * source: http://savaka2.github.io/scratch-extensions-directory/extensions/calcublock.js
 * To open and run this Scratch extension:
 * 1) open the URL on a web browser: http://scratchx.org/#scratch
 * 2) Select the option: "Open Extension URL"
 * 3) Paste: https://lefds.github.io/extensions/extension.js
 * 4) Click "I understand and continue"
 * 5) A new black block "calculate [5+5]" must appear.
 *
 * A primeira tentaiva não funcionou: deu erro visivel na dev window "Uncaught SyntaxError: Unexpected token <"
 * <script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js" type="text/javascript"></script>
 *
 */

 
/*
Load a block from github.io.
Accepts a url as a parameter which can include url parameters e.g. https://megjlow.github.io/extension2.js?name=SUN&ip=10.0.0.1
*/

new (function() {
	var ext = this;
	
	// LS modification BEGIN
	// var client = new Messaging.Client("mqtt.flespi.io", 80, 123254);	
	// var client = new Paho.MQTT.Client("iot.eclipse.org", Number(443), "/wss");
	
	//Attempting to use the jQuery library to load the MQTT client code ...
	
	$.getScript("http://lefds.github.io/extensions/paho-mqtt-min.js");

http://scratchx.org/libs/jquery-1.11.2.min.js
	
	//LS modeification END
	
	var descriptor = {
    	blocks: [
      		[' ', 'Load extension block %s', 'loadBlock', 'url', 'url'],
    	],
    	url: 'http://www.warwick.ac.uk/tilesfortales'
  	};
  
  	ext._shutdown = function() {};
  	
  	ext._getStatus = function() {
  		return {status: 2, msg: 'Device connected'}
  	};
  	
  	ext.loadBlock = function(url) {
  		ScratchExtensions.loadExternalJS(url);
  	};
  	
  	ScratchExtensions.register("extensionloader", descriptor, ext);
	
});
 

/*
 
(function(ext) {

 	
	ext._shutdown = function() {};
	ext._getStatus = function() {
		return {status: 2, msg: 'Ready'};
	};
	ext.eval = function(a) {
		return eval(a);
	};
	var descriptor = {
		blocks: [
			['r', 'calculate %s', 'eval', "5+5"],
		],
	};
	ScratchExtensions.register("CalcuBlock", descriptor, ext);
})({});

*/