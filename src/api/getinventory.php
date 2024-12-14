
<?php
	include("../config.php");
	$postData = json_decode(file_get_contents("php://input"), TRUE);
	if (!$postData) {
		echo 'no post data';
		mysqli_close($link);
	}
	$tableName = $postData['inventoryName']
	$inventorySql = "SELECT * FROM `$tableName`";
	$inventoryResult = mysqli_query($link, $inventorySql);
	if ($inventoryResult) {
		$inventoryArray = array();
		while($rows=mysqli_fetch_assoc($inventoryResult)){
			$inventoryArray[] = json_encode($rows, TRUE);
		}
		echo json_encode($inventoryArray);
	} else {
		echo `getting inventory didn't work eh`;
	}
	mysqli_close($link);
?>
