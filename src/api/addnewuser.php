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

    if (!$uid || !$email) {
        http_response_code(400); // Bad request
        echo json_encode(['error' => 'Missing required fields (uid or email)']);
        exit;
    }

    try {
        // Use PDO for database interaction
        $dsn = "mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4";
        $pdo = new PDO($dsn, $un, $pw, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // Throw exceptions on errors
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Fetch results as associative arrays
        ]);

        // Insert user if they don't already exist
        $sql = "INSERT IGNORE INTO users (uid, displayName, email, photoURL)
                VALUES (:uid, :displayName, :email, :photoURL)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':uid' => $uid,
            ':displayName' => $displayName,
            ':email' => $email,
            ':photoURL' => $photoURL,
        ]);

        // Fetch the user from the database
        $fetchSql = "SELECT * FROM users WHERE uid = :uid";
        $fetchStmt = $pdo->prepare($fetchSql);
        $fetchStmt->execute([':uid' => $uid]);
        $user = $fetchStmt->fetch();

        if ($user) {
            // Return the user object as JSON
            echo json_encode([
                'success' => true,
                'user' => $user,
                'message' => $stmt->rowCount() > 0 
                    ? 'User added successfully!' 
                    : 'User already exists; retrieved existing data.'
            ]);
        } else {
            http_response_code(404); // Not Found
            echo json_encode(['error' => 'User not found after insertion']);
        }
    } catch (PDOException $e) {
        // Handle database errors
        http_response_code(500); // Internal server error
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
?>
