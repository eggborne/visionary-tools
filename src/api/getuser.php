<?php
require_once('config.php');

error_log('Incoming request method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Request headers: ' . print_r(getallheaders(), true));

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$headers = getallheaders();
$auth_header = $headers['Authorization'] ?? '';
$json_data = json_decode(file_get_contents('php://input'), true);
$uid = $json_data['uid'] ?? null;

if (!$uid || !$auth_header) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required parameters']);
    exit();
}

// $token = str_replace('Bearer ', '', $auth_header);

// error_log('Attempting to verify user with UID: ' . $uid);
// error_log('Token: ' . $token);
// error_log('Token length: ' . strlen($token));

// $query = "SELECT uid, displayName, email, photoURL, authorizations FROM users WHERE uid = ? AND accessToken = ?";
$query = "SELECT uid, displayName, email, photoURL, authorizations FROM users WHERE uid = ?";

if (!($stmt = mysqli_prepare($link, $query))) {
    error_log('Database prepare failed: ' . mysqli_error($link));
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit();
}

// mysqli_stmt_bind_param($stmt, 'ss', $uid, $token);
mysqli_stmt_bind_param($stmt, 's', $uid);

if (!mysqli_stmt_execute($stmt)) {
    error_log('Query execution failed: ' . mysqli_stmt_error($stmt));
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit();
}

mysqli_stmt_store_result($stmt);
$count = mysqli_stmt_num_rows($stmt);

if ($count > 0) {

    $fetched_uid = null;
    $displayName = null;
    $email = null;
    $photoURL = null;
    $authorizations = null;
    
    // Bind the result columns in the same order as the SELECT statement
    mysqli_stmt_bind_result($stmt, $fetched_uid, $displayName, $email, $photoURL, $authorizations);
    
    mysqli_stmt_fetch($stmt);
    
    // Create the user object with your exact database structure
    $user = [
        'uid' => $fetched_uid,
        'displayName' => $displayName,
        'email' => $email,
        'photoURL' => $photoURL,
        'authorizations' => $authorizations ? json_decode($authorizations) : null
    ];
    
    echo json_encode([
        'success' => true,
        'user' => $user
    ]);
} else {
    error_log('No user found matching credentials for UID: ' . $uid);
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid credentials or user not found'
    ]);
}

mysqli_stmt_close($stmt);
?>