<?php
	include("config.php");
	$postData = json_decode(file_get_contents("php://input"), TRUE);
	if (!$postData) {
		echo 'no post data';
		mysqli_close($link);
	}
	$location = mysqli_real_escape_string($link, $postData['location']);
	$origin = mysqli_real_escape_string($link, $postData['origin'] ?? '');
	$height = floatval($postData['height']);
	$width = floatval($postData['width']);
	$depth = floatval($postData['depth']);
	$packaging = mysqli_real_escape_string($link, $postData['packaging'] ?? '');
	$notes = mysqli_real_escape_string($link, $postData['notes'] ?? '');
	$addItemSql = "INSERT INTO `inventory` 
    (`location`, `origin`, `height`, `width`, `depth`, `packaging`, `notes`) 
    VALUES 
    ('$location', '$origin', $height, $width, $depth, '$packaging', '$notes')";
	$result = mysqli_query($link, $addItemSql);

	if ($result) {
		echo 'Saved new canvas!';
	} else {
		echo 'Failed to save new canvas.';
	}	
	mysqli_close($link);
?>
