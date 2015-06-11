<?php

	$target_dir = "userData/";

	// Only DYJSON files allowed 
	$filename = $_FILES['file']['name'];
	$ext = pathinfo($filename, PATHINFO_EXTENSION);

	if (!($ext == "dyjson")) {
		echo "<h3>The file ". basename( $_FILES["file"]["name"]). " has not the right file format. 
		Filetype is " . $ext . " instead of .dyjson!<h3>";
		'<p>Please check and try again</p>.'
		echo "<br/><br/><a href=\"/~bbach/multipiles\">Back <--</a>";

	}else{
		if (move_uploaded_file(
				$_FILES["file"]["tmp_name"], 
				$target_dir . basename( $_FILES["file"]["name"])
				)) {    
			// echo '<h3 style="color:green;">File '. basename( $_FILES["file"]["name"]). ' has been uploaded. </h3>';
			// echo '<a href="multipiles.html?data='.$target_dir . basename( $_FILES["file"]["name"]).'">Show me</a>';
		header( 'Location: multipiles.html?data='.$target_dir . basename( $_FILES["file"]["name"])) ;
		}
	}





// 	echo "<br/><br/><a href=\"/~bbach/multipiles\">Back <--</a>";

// 	$target_dir = "userData/";

// 	echo "<h3>Uploading " . sizeof($_FILES["files"]["name"]) . " files<h3>"; 

// 	for ($i=0; $i< sizeof($_FILES["files"]["name"]); $i++){

// 		echo "<h3>Upload ". basename( $_FILES["files"]["name"][$i]); 

// 		// Only DYJSON files allowed 
// 		$filename = $_FILES['files']['name'][$i];
// 		$ext = pathinfo($filename, PATHINFO_EXTENSION);

// 		if (!($ext == "dyjson")) {
// 			echo "<h3>The file ". basename( $_FILES["files"]["name"][$i]). " has not the right file format. 
// 			Filetype is " . $ext . " instead of .dyjson!<h3>";
// 			// i--;
// 			continue;
// 		}else{
// 			if (move_uploaded_file(
// 					$_FILES["files"]["tmp_name"][$i], 
// 					$target_dir . basename( $_FILES["files"]["name"][$i])
// 					)) {    
// 				echo '<h3 style="color:green;">File '. basename( $_FILES["files"]["name"][$i]). ' has been uploaded. </h3>';
// 				echo '<a href="multipiles.html?data='.$target_dir . basename( $_FILES["files"]["name"][$i]).'">Show me</a>';
// 			}
// 		}
// 	}

// echo "<br/><br/><a href=\"/~bbach/multipiles\">Back <--</a>";

?>
