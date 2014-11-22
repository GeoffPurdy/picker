$.index.open();
var selected;

// $.picker getSelectedColumns getSelectedRow title
$.picker.addEventListener('change',function(e) {
	selected =  e.selectedValue.join('');
	Ti.API.info( selected );
//    Ti.API.info("You selected row: "+e.row+", column: "+e.column+", custom_item: "+e.row.custom_item);
//    label.text = "row index: "+e.rowIndex+", column index: "+e.columnIndex;
});




var xhr = Ti.Network.createHTTPClient({
    onload: function(e) {
        Ti.API.debug(this.responseText);
        var doc = this.responseXML.documentElement;
        // API is shitty and this is a work around
        // API returns '200 OK' with a list of suggestions if word is NOT found
        // work around by looking for suggestions and treating as word not found if present
        var suggestions = doc.getElementsByTagName("suggestion");
        if( suggestions.length > 0) {
          $.definition.text = "Word doesn't exist in dictionary.";
        } 
        else {
          $.definition.text = doc.getElementsByTagName("entry").item(0).getAttribute("id") + 
            ": " + doc.getElementsByTagName("pr").item(0).text +
             " " + doc.getElementsByTagName("dt").item(0).text;
        }
    },
    onerror: function(e) {
		// this function is called when an error occurs, including a timeout
        Ti.API.debug(e.error);
        alert('error');
    },
    timeout:5000  /* in milliseconds */
});


function doClick(e){
    Titanium.API.info("You clicked the button");
    var url = "http://www.dictionaryapi.com/api/v1/references/sd2/xml/" + selected + "?key=7a504103-e56f-4392-96f0-0bf3c6f7eb52";
    xhr.open("GET", url);
    xhr.send();  // request is actually sent with this statement

};
