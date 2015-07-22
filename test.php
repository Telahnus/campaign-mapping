<?php
    
	file_put_contents('log1.txt', "json_encode($_POST)");
	if ($_POST){
		echo $_POST;
	}
	else echo "failed";

//echo 'hello world';


/*    $myfile = fopen("markers.txt", "w");
    fwrite($myfile, json_encode($_POST));
    fclose($myfile);
    return 1;*/
?>