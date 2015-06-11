var SESSION_PILING = "piling"
var SESSION_SLIDER = "slider"
var SESSION_DATA = "data"
var SESSION_MATRIX_NUM = "matrixNum"
var SESSION_NODE_ORDERING = "nodeOrdering"

var ALL = [SESSION_PILING, SESSION_SLIDER, SESSION_DATA, SESSION_MATRIX_NUM, SESSION_NODE_ORDERING]

var SEP = "#"


function saveSession(){ 

	// WRITE PILING		

	var s = $('#sessionName')[0].value;
	_isLoadedSession = _isLoadedSession && SESSION_NAME == s
	SESSION_NAME = s;

	// console.log("SESSION_NAME", SESSION_NAME);
	if(!_isLoadedSession){
		var sessions = JSON.parse($.jStorage.get("sessions"))
		if(!sessions)
			sessions = []
		sessions.push(SESSION_NAME)	
		$.jStorage.set("sessions", JSON.stringify(sessions))
	}

	$.jStorage.set(SESSION_NAME + SEP + SESSION_DATA, FILE)


	var piling = []
	var orderings = []

	for(var p=0 ; p<piles.length ; p++){
		piling[p] = [];
		orderings[p] = piles[p].currentNodeOrder;
		console.log(orderings[p]);
		for(var i=0 ; i<piles[p].pileMatrices.length ; i++){
			piling[p].push(piles[p].pileMatrices[i].id)
		}
	}
    $.jStorage.set(SESSION_NAME + SEP + SESSION_PILING, JSON.stringify(piling))
    $.jStorage.set(SESSION_NAME + SEP + SESSION_NODE_ORDERING, JSON.stringify(orderings))

 	$.jStorage.set(SESSION_NAME + SEP + SESSION_SLIDER, slider.currentValue)
 	$.jStorage.set(SESSION_NAME + SEP + SESSION_MATRIX_NUM, SHOW_MATRICES)

}

function loadSession(){

	_isLoadedSession = true;
	var menu = $('#sessionSelection')[0];
	SESSION_NAME = menu.options[menu.selectedIndex].text;
    if(!SESSION_NAME) return;

    SHOW_MATRICES = JSON.parse($.jStorage.get(SESSION_NAME + SEP + SESSION_MATRIX_NUM))
	
    file = $.jStorage.get(SESSION_NAME + SEP + SESSION_DATA);
	file = file.replace('"', '');
	file = file.replace('"', '');
	console.log(file)
	loadFile(file);
}

function finalizeLoadSession()
{
 	var piling = JSON.parse( $.jStorage.get(SESSION_NAME + SEP + SESSION_PILING));
    var mats;
    for(var p=0 ; p<piling.length ; p++){
		mats = [];
		for(var i=0 ; i<piling[p].length ; i++){
			mats.push(matrices[piling[p][i]])
		}
		pile(mats, mats[0].pile)
	}	

	var ordering = JSON.parse( $.jStorage.get(SESSION_NAME + SEP + SESSION_NODE_ORDERING));
    for(var p=0 ; p<piling.length ; p++){
		piles[p].setNodeOrder(ordering[p]);
	}	
}

function deleteSession(){

	SESSION_NAME = $('#sessionSelection')[0].value;
    $.jStorage.deleteKey(SESSION_NAME + SEP + SESSION_PILING);
    $.jStorage.deleteKey(SESSION_NAME + SEP + SESSION_DATA);
    $.jStorage.deleteKey(SESSION_NAME + SEP + SESSION_SLIDER);
    $.jStorage.deleteKey(SESSION_NAME + SEP + SESSION_MATRIX_NUM);


	var sessions = JSON.parse($.jStorage.get("sessions"))
	sessions.splice(sessions.indexOf(SESSION_NAME),1);
	$.jStorage.set("sessions", JSON.stringify(sessions))

	retrieveSessions();
}

function retrieveSessions(){

	$("#sessionSelection").empty();

	var sessions = JSON.parse($.jStorage.get("sessions"))
   	if(!sessions) return;


   	for(var i=sessions.length-1 ; i>=0 ; i--){
	   	$("#sessionSelection")
    	    .append('<option>' + sessions[i] + '</option>')
	}
}

function getSessionDump(sessionname){
	var dump = '{"sessionName":"' + SESSION_NAME + '",'
	for(var i=0; i<ALL.length; i++){
		if(ALL[i] == 'data')
			dump += '"' + ALL[i] + '":' + JSON.stringify($.jStorage.get(SESSION_NAME + SEP + ALL[i])) + ","
		else
			dump += '"' + ALL[i] + '":' + $.jStorage.get(SESSION_NAME + SEP + ALL[i]) + ","
	}
	dump = dump.substring(0, dump.length - 1);
	dump += "}"
	return dump;
}

function importSession(){

	console.log("IMPORT SESSION")
	var dump = $("#sessionImport")[0].value
	console.log(dump)

	var json = JSON.parse(dump);
	SESSION_NAME = json.sessionName;
	var sessions = JSON.parse($.jStorage.get("sessions"))
		if(!sessions)
			sessions = []

		sessions.push(SESSION_NAME)	
		$.jStorage.set("sessions", JSON.stringify(sessions))

	$.jStorage.set(SESSION_NAME + SEP + SESSION_PILING, JSON.stringify(json.piling))
	// console.log(json.piling)
	$.jStorage.set(SESSION_NAME + SEP + SESSION_SLIDER, JSON.stringify(json.slider))
	// console.log(json.slider)
	$.jStorage.set(SESSION_NAME + SEP + SESSION_DATA, JSON.stringify(json.data))
	// console.log(json.data)
	$.jStorage.set(SESSION_NAME + SEP + SESSION_MATRIX_NUM, JSON.stringify(json.matrixNum))
	// console.log(json.matrixNum)
	$.jStorage.set(SESSION_NAME + SEP + SESSION_NODE_ORDERING, JSON.stringify(json.nodeOrdering))
	// console.log(json.nodeOrdering)

	var menu = $('#sessionSelection')
		.append('<option>' + SESSION_NAME + '</option>')

}


