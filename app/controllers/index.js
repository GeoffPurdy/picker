

var word = "game".split("");
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


function doClick(e){ 
	
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
          // TODO clean this up, but be sure not to call methods on null if attribute doesn't exist
          $.definition.text = "";
          if( doc.getElementsByTagName("entry").item(0).hasAttribute("id") ) { $.definition.text += doc.getElementsByTagName("entry").item(0).getAttribute("id"); } 
          $.definition.text +=  ": ";
          if( doc.getElementsByTagName("pr") ) { $.definition.text += doc.getElementsByTagName("pr").item(0).text; }
          $.definition.text +=  ": ";
          if( doc.getElementsByTagName("dt") ) { $.definition.text += doc.getElementsByTagName("dt").item(0).text; }
          $.definition.text = $.definition.text.replace(/\[.*?\]/g,'');
        }
    },
    onerror: function(e) {
		// this function is called when an error occurs, including a timeout
        Ti.API.debug(e.error);
        alert('error');
    },
    timeout:5000  /* in milliseconds */
    });

    var url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/" 
              + word + "?key=6561a4ac-064f-4290-80b2-4101a8085451";
    Ti.API.info(url);
    Ti.API.info(golden_path.join("|"));
    Ti.API.info( golden_path.indexOf( word ) );
    Ti.API.info(already_used);
    already_used.push(word);
    $.moves.text = parseInt( $.moves.text ) - 1;
    if(word === $.info.text) {  
    	alert("Ladder Complete"); 
    	$.score.text = parseInt( $.score.text ) + 1;
    	golden_path = already_used = [];
    	setInfoColor("green");
    	doCreateLadder();
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


function doCreateLadder(){
    Titanium.API.info("You clicked the create button.");
    //var url = Ti.App.Properties.getString("SERVER_URL");
    //var n4j_url = "http://localhost:7474/db/data/cypher";
    var n4j_url = "http://0.0.0.0:3000/words/get_random_path.json?length=4";  
    
    var n4j = Ti.Network.createHTTPClient({
        onload : function(e) {
            var dat = JSON.parse( this.responseText );
            Ti.API.info("dat[0].extracted=" + dat[0].extracted );
            golden_path = dat[0].extracted;  
            word = golden_path[0].split("");
            $.info.text = golden_path[ golden_path.length - 1 ];
            $.moves.text = golden_path.length;
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
	$.moves.animate({
	  backgroundColor:color, 
	  color: 'black',
	  duration:3000, 
	  curve:Titanium.UI.ANIMATION_CURVE_EASE_IN_OUT,
	  autoreverse: true
    });
}

function openPopover() {
    var popover = Alloy.createController('popover').getView();
    popover.show({view:$.button});
};

// the picker has to be displayed BEFORE rows can be set
// thus an event listener on 'open'
$.index.addEventListener('open', function() {
  setPickerRows();
  doCreateLadder();      
});

$.picker.addEventListener('change',function(e) {
	word =  e.selectedValue.join('');
});
 
initPickerColumns();
$.index.open();
openPopover();
