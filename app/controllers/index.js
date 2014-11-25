$.index.open();

var NUM_COLS = 4;
var selected;

var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
var new_column = Ti.UI.createPickerColumn();

for(var j=0;j<NUM_COLS;j++) { // FIXME words greater than 13-14 letters drop the last picker column

	for (var i = 0; i < letters.length; i++) {
		var row = Ti.UI.createPickerRow();
		row.title = letters[i],
		new_column.addRow(row);
	}
    $.picker.add(new_column);
}

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
        // The following is ugly and requires explanation so here goes:
        // API is sub-optimal and this is a work around
        // API returns '200 OK' even if word is NOT found
        // returns suggestions that look just like definitions
        // existence of suggestion nodes means word wasn't found
        // or a '200 OK' and an empty list if nothing remotely similar exists 
        // work around by looking for suggestions and treating as word not found if present
        var suggestions = doc.getElementsByTagName("suggestion");
        Ti.API.info("suggestions.length=" + suggestions.length);
        if( (suggestions.length > 0) || (! doc.getElementsByTagName("entry")) ) {
          $.definition.text = "Word doesn't exist in dictionary.";
        } 
        else {
          Ti.API.info("good API call");
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
    Titanium.API.info("You clicked the button.  Selected = " + selected);
    var url = "http://www.dictionaryapi.com/api/v1/references/sd2/xml/" + selected + "?key=7a504103-e56f-4392-96f0-0bf3c6f7eb52";
    Ti.API.info(url);
    xhr.open("GET", url);
    xhr.send();  // request is actually sent with this statement
};
