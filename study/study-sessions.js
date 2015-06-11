var S_SUBJECT = "subject"
var S_TRAIL = "trail"
var S_TECHNIQUE = "technique"
var S_TASK = "task"
var S_DATA = "data"
var S_TIME = "time"
var S_ERROR = "error"
var S_TRAINING = "training"
var SEP = "_"
ALL = [ S_TRAIL,
		S_TECHNIQUE,
		S_TASK,
		S_DATA,
		S_TIME,
		S_ERROR,
		S_TRAINING ]


function writeSession(duration, error, training){
    $.jStorage.set(_subject + SEP + S_SUBJECT + SEP + _currentTrail, _subject)
    $.jStorage.set(_subject + SEP + S_TRAIL + SEP + _currentTrail, _currentTrail)
    $.jStorage.set(_subject + SEP + S_TECHNIQUE + SEP + _currentTrail, _currentTechnique)

 	$.jStorage.set(_subject + SEP + S_TASK + SEP + _currentTrail, _currentTask)
 	$.jStorage.set(_subject + SEP + S_DATA + SEP + _currentTrail, _currentData)
 	$.jStorage.set(_subject + SEP + S_TIME + SEP + _currentTrail, duration)
 	$.jStorage.set(_subject + SEP + S_ERROR + SEP + _currentTrail, error)
 	$.jStorage.set(_subject + SEP + S_TRAINING + SEP + _currentTrail, training)
}

function loadSession(){

	_isLoadedSession = true;
	var menu = $('#sessionSelection')[0];
	_subject = menu.options[menu.selectedIndex].text;
    if(!_subject) return;

    SHOW_MATRICES = JSON.parse($.jStorage.get(_subject + SEP + SESSION_MATRIX_NUM))
	
    file = $.jStorage.get(_subject + SEP + SESSION_DATA);
	file = file.replace('"', '');
	file = file.replace('"', '');
	console.log(file)
	loadFile(file);
}


function getSessionDump(){
	var dump = []
	for(var t=0; t<_currentTrail; t++){
		for(var i=0; i<ALL.length; i++){
			dump += '"' + $.jStorage.get(_subject + SEP + ALL[i]+ SEP + t) + '",'
		}
		dump += '\n'	
	}
	return dump;
}


