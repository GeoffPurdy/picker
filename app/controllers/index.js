$.index.open();
// $.picker getSelectedColumns getSelectedRow title
$.picker.addEventListener('change',function(e) {
	var selected =  e.selectedValue.join('');
	Ti.API.info( selected );
//    Ti.API.info("You selected row: "+e.row+", column: "+e.column+", custom_item: "+e.row.custom_item);
//    label.text = "row index: "+e.rowIndex+", column index: "+e.columnIndex;
});

var url = "http://www.dictionaryapi.com/api/v1/references/sd2/xml/accelerate?key=7a504103-e56f-4392-96f0-0bf3c6f7eb52";



var xhr = Ti.Network.createHTTPClient({
    onload: function(e) {
		// this function is called when data is returned from the server and available for use
        // this.responseText holds the raw text return of the message (used for text/JSON)
        // this.responseXML holds any returned XML (including SOAP)
        // this.responseData holds any returned binary data
        Ti.API.debug(this.responseText);
        var doc = this.responseXML.documentElement;
//        $.definition.text = doc.getElementsByTagName("entry").item(0).getAttribute("id") + 
            ": " + doc.getElementsByTagName("pr").item(0).text +
             " " + doc.getElementsByTagName("dt").item(0).text;
    },
    onerror: function(e) {
		// this function is called when an error occurs, including a timeout
        Ti.API.debug(e.error);
        alert('error');
    },
    timeout:5000  /* in milliseconds */
});

xhr.open("GET", url);
xhr.send();  // request is actually sent with this statement

