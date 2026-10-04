<?php

require_once "config/database.php";

$message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name = $_POST["name"];
    $email = $_POST["email"];
    $password = $_POST["password"];

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $name, $email, $hashed_password);

    if ($stmt->execute()) {
        $message = "Account created successfully!";
    } else {
        $message = "Error: " . $stmt->error;
    }

    $stmt->close();
}

?>

<!DOCTYPE html>
<html>
<head>
    <title>AssetTrack - Register</title>
</head>

<body>

    <h1>Create an Account</h1>

    <?php if ($message != ""): ?>
        <p><?php echo $message; ?></p>
    <?php endif; ?>

    <form method="POST">

        <label>Name:</label><br>
        <input type="text" name="name" required>
        <br><br>

        <label>Email:</label><br>
        <input type="email" name="email" required>
        <br><br>

        <label>Password:</label><br>
        <input type="password" name="password" required>
        <br><br>

        <button type="submit">Register</button>

    </form>

</body>
</html>