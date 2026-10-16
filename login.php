<?php
session_start();

require_once "config/database.php";

$message = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST["email"]);
    $password = $_POST["password"];

    $sql = "SELECT user_id, name, email, password
            FROM users
            WHERE email = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();

    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user["password"])) {
            $_SESSION["user_id"] = $user["user_id"];
            $_SESSION["name"] = $user["name"];
            $_SESSION["email"] = $user["email"];

            header("Location: dashboard.php");
            exit();
        } else {
            $message = "Incorrect email or password.";
        }
    } else {
        $message = "Incorrect email or password.";
    }

    $stmt->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>AssetTrack - Login</title>

    <link rel="stylesheet" href="css/style.css">
</head>
<body>

    <div class="container">

        <div class="left-side">
            <div class="logo">⬡</div>

            <h1>AssetTrack</h1>

            <p class="tagline">
                Monitor · Maintain · Keep It Running
            </p>

            <p class="description">
                A web-based asset monitoring and maintenance
                reporting system that organizations can configure
                for their own equipment and materials.
            </p>
        </div>

        <div class="right-side">

            <h2>Welcome Back!</h2>

            <p class="subtitle">
                Log in to your workspace
            </p>

            <?php if ($message !== ""): ?>
                <p class="error-message">
                    <?php echo htmlspecialchars($message); ?>
                </p>
            <?php endif; ?>

            <form id="loginForm" method="POST" action="login.php">

                <label for="email">Email</label>

                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    autocomplete="email"
                    required
                >

                <label for="password">Password</label>

                <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    autocomplete="current-password"
                    required
                >

                <button type="submit">
                    Login
                </button>

            </form>

            <p class="account-text">
                Don't have an account?
            </p>

            <a href="register.php" class="create-btn">
                Create Account
            </a>

        </div>

    </div>

    <script src="js/script.js"></script>

</body>
</html>