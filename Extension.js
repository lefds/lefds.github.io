new (function() {
	$.ajax({

        async:false,

        type:'GET',

        url:'https://gist.githubusercontent.com/anonymous/1ec6455373e830b14909/raw/317c028d794c272202d57abbc44905a387b1e8a0/extension.js',
		
        data:null,
        
        success: function(){},

		error: function(){},

        dataType:'script'

    	});
	var ext = this;
	var descriptor = {
		blocks: [
			[" ", "Open %m.links", "openLink", "link"],
			[" ", "Open %m.links in new tab", "openLinkNewTab", "link"],
			[" ", "Safe Search https://scratch.mit.edu/ %s", "openScratch", "project/xxxxx"],
			[" ", "Scratch Search %s", "searchScratch", "search"],
			[" ", "Change browser to %m.costumes", "searchB", "Browser"],
			["b", "Change browser to %m.costumes", "searchB", "Browser"],
			[" ", "Safe Search https://scratchx.org/ %s", "openScratchX", "project/xxxxx"],
			[" ", "Go to web page: %s","goto", "scratch.mit.edu"],
			['R', 'Search %s result number %n with %m.returnVal', 'resultsX', '', 1, ''],
			//[" ", "Search google for %s", "googleS", "scratch.mit.edu"],
			[' ', 'Upload Extension from url %s', 'upLoad', 'https://...'],
			],
			menus: {
				links: ["scratch.mit.edu", "scratchx.org", "khanacademy.org"],
				costumes: ["bing", "google", "yahoo", "ask"],
				returnVal: ["Title", "URL", "Content", "All"],
			},
url: 'https://gist.githubusercontent.com/anonymous/1ec6455373e830b14909/raw/317c028d794c272202d57abbc44905a387b1e8a0/extension.js'
			};
	ext._shutdown = function() {};
	
	ext._getStatus = function() {
		return {status:2, msg:"Ready"};
	};
	
	ext.openLink = function(url) {
		window.location = url
	};

	ext.openLinkNewTab = function(url) {
		window.open("http://" + url);
	};
	
	ext.openScratch = function(url) {
		window.open("http://scratch.mit.edu/" + url)
	};
	ext.searchScratch = function(url) {
		window.open("https://scratch.mit.edu/search/google_results/?q=" + url)
	};
	ext.searchB = function(url) {
		window.open("http://" + url + ".com")
	};
	
	ext.openScratchX = function(url) {
		window.open("http://scratchX.org/" + url)
	};

	ext.goto = function(url) {
		window.open("http://" + url)
	};

	ext.upLoad = function(url) {
		ScratchExtensions.loadExternalJS(url)
	};

	ext.resultsX = function(item, number, menu, callback) {
		$.get("http://crossorigin.me/http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=" + item + "&rsz=1&start=" + number + "&safe=active", {}, 
			function(data){

			if(menu == "Title"){
				callback(data['responseData']['results'][0]['titleNoFormatting']);
			}else if(menu == "URL"){
				callback(data['responseData']['results'][0]['unescapedUrl']);
			}else if(menu == "Content"){
				callback(data['responseData']['results'][0]['content']);
			}else if(menu == "All"){
				callback("ERROR, something went wrong!!");
			}else{
				callback("ERROR, something went wrong!!");
			}
		}, "json")
	};

	//ext.googleS = function(url) {window.open("https://www.google.com/webhp?authuser=1#authuser=1&q=" + url)};
	
	ScratchExtensions.register("Browser Actions", descriptor, ext);
	
})();