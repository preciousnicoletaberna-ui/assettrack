<?php

session_start();

require_once "config/database.php";

// Check if user is logged in
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION["user_id"];

// Check if workspace ID was provided
if (!isset($_GET["id"])) {
    header("Location: dashboard.php");
    exit();
}

$workspace_id = $_GET["id"];

// Get workspace information
$sql = "SELECT workspace_id, workspace_name, workspace_code
        FROM workspaces
        WHERE workspace_id = ? AND owner_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $workspace_id, $user_id);
$stmt->execute();

$result = $stmt->get_result();

// Check if workspace exists
if ($result->num_rows != 1) {
    echo "Workspace not found.";
    exit();
}

$workspace = $result->fetch_assoc();

$stmt->close();

?>

<!DOCTYPE html>
<html>

<head>

    <title>
        AssetTrack - <?php echo htmlspecialchars($workspace["workspace_name"]); ?>
    </title>

</head>

<body>

    <h1>AssetTrack</h1>

    <h2>
        <?php echo htmlspecialchars($workspace["workspace_name"]); ?>
    </h2>

    <p>
        Workspace Code:
        <?php echo htmlspecialchars($workspace["workspace_code"]); ?>
    </p>

    <hr>

    <h2>Workspace</h2>

    <p>
        This is your workspace.
    </p>

    <br>

    <a href="add_asset.php?id=<?php echo $workspace["workspace_id"]; ?>">
        Add Asset
    </a>

    <br><br>

    <a href="dashboard.php">
        Back to Dashboard
    </a>

</body>

</html>