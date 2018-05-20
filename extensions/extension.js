/*
 * source: http://savaka2.github.io/scratch-extensions-directory/extensions/calcublock.js
 * To open and run this Scratch extension:
 * 1) open the URL on a web browser: http://scratchx.org/#scratch
 * 2) Select the option: "Open Extension URL"
 * 3) Paste: https://lefds.github.io/extensions/extension.js
 * 4) Click "I understand and continue"
 * 5) A new black block "calculate [5+5]" must appear.
 */

<script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js" type="text/javascript">
</script>
 
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