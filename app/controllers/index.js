

var word = "WORD".split("");
var golden_path = [];
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
var selected;



function initPickerColumns() {
  for(var j=0;j<word.length;j++) { // FIXME words greater than 13-14 letters drop the last picker column
    var new_column = Ti.UI.createPickerColumn();
	for (var i = 0; i < alphabet.length; i++) {
		var row = Ti.UI.createPickerRow();
		row.title = alphabet[i],
		new_column.addRow(row);
	}
    $.picker.add(new_column);
  }
}

function setPickerRows() {
  Ti.API.info("in open event listener.");
  for(var k=0; k<word.length; k++) {
    Ti.API.info("word[k]=" + word[k]);
    Ti.API.info("indexOf()=" + alphabet.indexOf( word[k] ));
    $.picker.setSelectedRow(k, alphabet.indexOf( word[k] ), false);
  }
  setTimeout(function(){ // FIXME this may be a race condition; 
    $.button.fireEvent('click');
  }, 200);
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
          // FIXME check existence of each element before invoking any methods on it
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
    var url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/" 
              + selected + "?key=6561a4ac-064f-4290-80b2-4101a8085451";
    Ti.API.info(url);
    xhr.open("GET", url);
    xhr.send();  
};


function doCreateLadder(e){
    Titanium.API.info("You clicked the create button.");
    //var url = Ti.App.Properties.getString("SERVER_URL");
    //var n4j_url = "http://localhost:7474/db/data/cypher";
    var n4j_url = "http://0.0.0.0:3000/words/get_path.json";
    var start = $.start_word.value.toUpperCase();
    var target = $.target_word.value.toUpperCase();
    n4j_url += "?" + "source=" + start.toLowerCase() + "&" + "target=" + target.toLowerCase();
    
    if(!start || !target || start.length != target.length) {
    	alert("Start word and end word must be present and equal length!");
    	return;
    }
    
    var n4j = Ti.Network.createHTTPClient({
        onload : function(e) {
            var dat = JSON.parse( this.responseText );
            Ti.API.info("dat[0].extracted=" + dat[0].extracted );
            golden_path = dat[0].extracted;  
            word = start.split("");
            $.info.value = target;
            //initPickerColumns();
            setPickerRows();
        },
        onerror : function(e) {
            Ti.API.error(e);
            alert('Error while posting query to neo4j');
        },
        timeout : 5000
    });
 
    n4j.open("GET", n4j_url);
    n4j.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    Ti.API.info(n4j_url);
    n4j.send();

}

$.index.addEventListener('open', function() {
  setPickerRows();      
});
 
initPickerColumns();
$.index.open();
$.info.animate({
	backgroundColor:'#F00', 
	color: 'white',
	duration:3000, 
	curve:Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT
});
