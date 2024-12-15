<?php
/**
 * Add New Inventory Item API Endpoint
 * 
 * This endpoint handles the creation of new inventory items with comprehensive
 * input validation, prepared statements for SQL injection prevention, and
 * proper error handling with JSON responses.
 * 
 * Expected POST JSON format:
 * {
 *   "location": string,
 *   "origin": string,
 *   "height": number,
 *   "width": number,
 *   "depth": number,
 *   "packaging": string,
 *   "notes": string
 * }
 */

declare(strict_types=1);

// Import configuration and set error handling
require_once("../config.php");

// Set response header to JSON
header('Content-Type: application/json');

/**
 * Validates and sanitizes the input data
 * 
 * @param array $data The input data to validate
 * @return array Array containing validation status and messages
 */
function validateInput(array $data): array {
    $errors = [];
    $sanitizedData = [];

    // Required fields validation
    $requiredFields = ['height', 'width', 'depth'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            $errors[] = "Missing required field: {$field}";
        }
    }

    // Numeric validation for dimensions
    $numericFields = ['height', 'width', 'depth'];
    foreach ($numericFields as $field) {
        if (isset($data[$field])) {
            if (!is_numeric($data[$field]) || $data[$field] <= 0) {
                $errors[] = "{$field} must be a positive number";
            } else {
                $sanitizedData[$field] = floatval($data[$field]);
            }
        }
    }

    // String field validation and basic sanitization
    $stringFields = ['location', 'origin', 'packaging', 'notes'];
    foreach ($stringFields as $field) {
        if (isset($data[$field])) {
            // Just trim whitespace - we'll handle HTML encoding when displaying
            $sanitizedData[$field] = trim($data[$field]);
        } else {
            $sanitizedData[$field] = ''; // Set default empty string for optional fields
        }
    }

    return [
        'isValid' => empty($errors),
        'errors' => $errors,
        'sanitizedData' => $sanitizedData
    ];
}

try {
    // Get and decode JSON input
    $jsonInput = file_get_contents('php://input');
    if (!$jsonInput) {
        throw new Exception('No input data received');
    }

    $postData = json_decode($jsonInput, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON format: ' . json_last_error_msg());
    }

    // Validate and sanitize input
    $validation = validateInput($postData);
    if (!$validation['isValid']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validation['errors']
        ]);
        exit;
    }

    // Create PDO connection with error handling
    $dsn = "mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4";
    $pdo = new PDO($dsn, $un, $pw, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    // Prepare and execute the insert statement
    $sql = "INSERT INTO `loren-inventory` 
            (location, origin, height, width, depth, packaging, notes) 
            VALUES (:location, :origin, :height, :width, :depth, :packaging, :notes)";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':location' => $validation['sanitizedData']['location'],
        ':origin' => $validation['sanitizedData']['origin'],
        ':height' => $validation['sanitizedData']['height'],
        ':width' => $validation['sanitizedData']['width'],
        ':depth' => $validation['sanitizedData']['depth'],
        ':packaging' => $validation['sanitizedData']['packaging'],
        ':notes' => $validation['sanitizedData']['notes']
    ]);

    // Return success response with the new item's ID
    echo json_encode([
        'success' => true,
        'message' => 'Item added successfully',
        'id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    // Handle database-specific errors
    http_response_code(500);
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'A database error occurred',
        'error' => $e->getMessage()
    ]);

} catch (Exception $e) {
    // Handle general errors
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>