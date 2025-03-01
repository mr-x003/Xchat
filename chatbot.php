<?php
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['user_message'])) {
    $user_message = urlencode($_POST['user_message']);
    $api_url = "https://deepseek.privates-bots.workers.dev/?question={$user_message}";

    // Initialize cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Set a timeout (in seconds)

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        $error_msg = curl_error($ch);
    }
    curl_close($ch);

    // Decode the API response
    $data = json_decode($response, true);

    if (isset($data['message'])) {
        echo json_encode(["response" => $data['message']]);
    } else {
        echo json_encode(["response" => "Oops! Something went wrong with the API response."]);
    }
}
?>