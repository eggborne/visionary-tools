
<?php
	include("config.php");
	$inventorySql = "SELECT * FROM `inventory`";
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
