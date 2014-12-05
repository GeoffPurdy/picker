

var word = "word".split("");
var target = "game";
var golden_path = [];
var already_used = [];
var alphabet = "abcdefghijklmnopqrstuvwxyz".split('');


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
    var url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/" 
              + word + "?key=6561a4ac-064f-4290-80b2-4101a8085451";
    Ti.API.info(url);
    Ti.API.info(golden_path.join("|"));
    Ti.API.info( golden_path.indexOf( word ) );
    Ti.API.info(already_used);
    already_used.push(word);
    $.steps.text = parseInt( $.steps.text ) + 1;
    if(word === target) {  
    	alert("Ladder Complete"); 
    	$.score.text = parseInt( $.score.text ) + 1;
    	golden_path = already_used = [];
    	setInfoColor("green");
    } 
    else if ( golden_path.indexOf(word) >= 0 ) {
    	setInfoColor("green");
    } 
    else {
    	setInfoColor("red");
    }
    xhr.open("GET", url);
    xhr.send();  
};


function doCreateLadder(e){
    Titanium.API.info("You clicked the create button.");
    //var url = Ti.App.Properties.getString("SERVER_URL");
    //var n4j_url = "http://localhost:7474/db/data/cypher";
    var n4j_url = "http://0.0.0.0:3000/words/get_path.json";
    var start = $.start_word.value.toLowerCase();
    target = $.target_word.value.toLowerCase();
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
            $.info.text = target;
            $.optimal.text = golden_path.length;
            $.steps.text = already_used.length;
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

function setInfoColor(color) {
	$.steps.animate({
	  backgroundColor:color, 
	  color: 'black',
	  duration:3000, 
	  curve:Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT,
	  autoreverse: true
    });
}

// the picker has to be displayed BEFORE rows can be set
// thus an event listener on 'open'
$.index.addEventListener('open', function() {
  setPickerRows();      
});

$.picker.addEventListener('change',function(e) {
	word =  e.selectedValue.join('');
});
 
initPickerColumns();
$.index.open();

