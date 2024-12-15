<?php
    include("config.php");

    // Decode JSON input
    $postData = json_decode(file_get_contents("php://input"), true);

    if (!$postData) {
        http_response_code(400); // Bad request
        echo json_encode(['error' => 'No post data received']);
        exit;
    }

    // Extract and sanitize input
    $uid = $postData['uid'] ?? null;
    $displayName = $postData['displayName'] ?? '';
    $email = $postData['email'] ?? null;
    $photoURL = $postData['photoURL'] ?? '';
    $accessToken = $postData['accessToken'] ?? '';

    if (!$uid || !$email) {
        http_response_code(400); // Bad request
        echo json_encode(['error' => 'Missing required fields (uid or email)']);
        exit;
    }

    try {
        // Use PDO for database interaction
        $dsn = "mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4";
        $pdo = new PDO($dsn, $un, $pw, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        // Use INSERT ... ON DUPLICATE KEY UPDATE to handle both new and existing users
        $sql = "INSERT INTO users (uid, displayName, email, photoURL, accessToken) 
                VALUES (:uid, :displayName, :email, :photoURL, :accessToken)
                ON DUPLICATE KEY UPDATE 
                    displayName = VALUES(displayName),
                    email = VALUES(email),
                    photoURL = VALUES(photoURL),
                    accessToken = VALUES(accessToken),
                    updated_at = CURRENT_TIMESTAMP";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':uid' => $uid,
            ':displayName' => $displayName,
            ':email' => $email,
            ':photoURL' => $photoURL,
            ':accessToken' => $accessToken,
        ]);

        // Fetch the updated user record
        $fetchSql = "SELECT * FROM users WHERE uid = :uid";
        $fetchStmt = $pdo->prepare($fetchSql);
        $fetchStmt->execute([':uid' => $uid]);
        $user = $fetchStmt->fetch();

        if ($user) {
            // Return the user object as JSON
            echo json_encode([
                'success' => true,
                'user' => $user,
                'message' => 'User data updated successfully!'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found after update']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
?>