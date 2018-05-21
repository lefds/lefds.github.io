(function(ext) {
    // TODO: public repo + documentation + samples
    // GH pages
    $.ajax({

        async:false,

        type:'GET',

        url:'http://lefds.github.io/extensions/paho-mqtt.js',

        data:null,
        
        success: function(){client = new Paho.MQTT.Client("127.0.0.1", Number(1883), "LSANTOS123");console.log('ok');}, //Create a MQTT reference

        dataType:'script'

    });
    window['temp'] = 0; // init
    
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
        console.log(""Fez algo); //Change value of broadcast so other clients get an update
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