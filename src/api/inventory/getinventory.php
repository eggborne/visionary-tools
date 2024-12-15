<?php
/**
 * Get Inventory Items API Endpoint
 * 
 * This endpoint retrieves inventory items based on the provided inventory name.
 * It implements pagination, error handling, and proper security measures.
 * 
 * Expected POST JSON format:
 * {
 *   "inventoryName": string,
 *   "page": number (optional, defaults to 1),
 *   "limit": number (optional, defaults to 50)
 * }
 * 
 * Response format:
 * {
 *   "success": boolean,
 *   "data": array of inventory items,
 *   "pagination": {
 *     "currentPage": number,
 *     "totalPages": number,
 *     "totalItems": number,
 *     "itemsPerPage": number
 *   }
 * }
 */

declare(strict_types=1);

require_once("../config.php");

// Set response header to JSON
header('Content-Type: application/json');

/**
 * Validates the inventory name against allowed tables
 * This prevents SQL injection via table names and restricts access to authorized tables
 */
function validateInventoryName(string $name): bool {
    // List of allowed inventory tables
    $allowedTables = [
        'loren-inventory'
        // Add other allowed tables here
    ];
    return in_array($name, $allowedTables, true);
}

/**
 * Sanitizes and validates pagination parameters
 */
function validatePagination(array $data): array {
    $page = isset($data['page']) ? max(1, intval($data['page'])) : 1;
    $limit = isset($data['limit']) ? min(max(1, intval($data['limit'])), 100) : 500;
    
    return [
        'page' => $page,
        'limit' => $limit,
        'offset' => ($page - 1) * $limit
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

    // Validate required fields
    if (!isset($postData['inventoryName']) || empty($postData['inventoryName'])) {
        throw new Exception('Inventory name is required');
    }

    // Validate inventory name
    if (!validateInventoryName($postData['inventoryName'])) {
        throw new Exception('Invalid inventory name');
    }

    // Get pagination parameters
    $pagination = validatePagination($postData);

    // Create PDO connection
    $dsn = "mysql:host=" . $host . ";dbname=" . $db_name . ";charset=utf8mb4";
    $pdo = new PDO($dsn, $un, $pw, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ]);

    // Get total count first
    $countSql = "SELECT COUNT(*) as total FROM `{$postData['inventoryName']}`";
    $countStmt = $pdo->query($countSql);
    $totalItems = (int)$countStmt->fetch()['total'];
    $totalPages = ceil($totalItems / $pagination['limit']);

    // Fetch paginated results
    $sql = "SELECT * FROM `{$postData['inventoryName']}` 
            ORDER BY width DESC 
            LIMIT :limit OFFSET :offset";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':limit', $pagination['limit'], PDO::PARAM_INT);
    $stmt->bindValue(':offset', $pagination['offset'], PDO::PARAM_INT);
    $stmt->execute();
    
    $items = $stmt->fetchAll();

    // Format numeric values
    array_walk($items, function(&$item) {
        // Convert numeric strings to actual numbers
        if (isset($item['height'])) $item['height'] = floatval($item['height']);
        if (isset($item['width'])) $item['width'] = floatval($item['width']);
        if (isset($item['depth'])) $item['depth'] = floatval($item['depth']);
        if (isset($item['id'])) $item['id'] = intval($item['id']);
    });

    // Return success response with pagination info
    echo json_encode([
        'success' => true,
        'data' => $items,
        'pagination' => [
            'currentPage' => $pagination['page'],
            'totalPages' => $totalPages,
            'totalItems' => $totalItems,
            'itemsPerPage' => $pagination['limit']
        ]
    ], JSON_NUMERIC_CHECK);

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