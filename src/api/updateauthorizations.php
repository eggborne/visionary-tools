<?php
    include("config.php");

    // Decode JSON input
    $postData = json_decode(file_get_contents("php://input"), true);

    if (!$postData) {
        http_response_code(400); // Bad request
        echo 'No post data received';
        exit;
    }

    // Extract and sanitize input
    $uid = $postData['uid'] ?? null;
    $authorizations = $postData['authorizations'] ?? null;

    if (!$uid || !is_array($authorizations)) {
        http_response_code(400); // Bad request
        echo 'Missing required fields (uid or authorizations) or invalid format';
        exit;
    }

    try {
        // Use PDO for database interaction
        $dsn = "mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4";
        $pdo = new PDO($dsn, $un, $pw, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // Throw exceptions on errors
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Fetch results as associative arrays
        ]);

        // Update the `authorizations` JSON column for the user
        $sql = "UPDATE users SET authorizations = :authorizations WHERE uid = :uid";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':authorizations' => json_encode($authorizations),
            ':uid' => $uid,
        ]);

        if ($stmt->rowCount() > 0) {
            echo "User authorizations updated successfully!";
        } else {
            echo "No changes made. User may not exist.";
        }
    } catch (PDOException $e) {
        // Handle database errors
        http_response_code(500); // Internal server error
        echo "Database error: " . $e->getMessage();
    }
?>