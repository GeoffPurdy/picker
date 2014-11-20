function doClick(e) {
  var url = "http://api.openweathermap.org/data/2.5/weather?q=Durham,nc";
  var json;
 
  var xhr = Ti.Network.createHTTPClient({
    onload: function() {
    // parse the retrieved data, turning it into a JavaScript object
    json = JSON.parse(this.responseText);
	}
  });
}

$.index.open();
