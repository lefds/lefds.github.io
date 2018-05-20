(function(ext) {
/*
 O meu objetivo é colocar informação deste módulo Reporter a ser enviada para um MQTT.
 Inspiração: 
   http://www.steves-internet-guide.com/using-javascript-mqtt-client-websockets/
   https://www.eclipse.org/paho/clients/js/
 
*/

/*
<script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.js" type="text/javascript">
</script>
*/
/*
Original Reporter block que devolve o cálculo do argumento
*/	
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
/*
Fim do Reporter block CalcuBlock
*/

})({});