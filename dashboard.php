<?php

session_start();

require_once "config/database.php";

// Check if user is logged in
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

$name = $_SESSION["name"];

?>

<!DOCTYPE html>
<html>

<head>

    <title>AssetTrack - Dashboard</title>

</head>

<body>

    <h1>AssetTrack</h1>

    <h2>Dashboard</h2>

    <p>Welcome, <?php echo htmlspecialchars($name); ?>!</p>

    <hr>

    <h3>Asset Overview</h3>

    <p>Total Assets: 0</p>
    <p>Working: 0</p>
    <p>Unrepaired: 0</p>
    <p>Under Repair: 0</p>
    <p>Repaired: 0</p>

    <hr>

    <h3>Quick Actions</h3>

    <button>Add Asset</button>
    <button>View Assets</button>
    <button>View Reports</button>

    <br><br>

    <a href="logout.php">Logout</a>

</body>

</html>