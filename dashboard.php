<?php

session_start();

require_once "config/database.php";

// Check if user is logged in
if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION["user_id"];
$name = $_SESSION["name"];

// Get the workspaces owned by the logged-in user
$sql = "SELECT workspace_id, workspace_name, workspace_code
        FROM workspaces
        WHERE owner_id = ?
        ORDER BY created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();

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

    <h2>Your Workspaces</h2>

    <?php if ($result->num_rows > 0): ?>

        <?php while ($workspace = $result->fetch_assoc()): ?>

            <div>

                <h3>
                    <?php echo htmlspecialchars($workspace["workspace_name"]); ?>
                </h3>

                <p>
                    Workspace Code:
                    <?php echo htmlspecialchars($workspace["workspace_code"]); ?>
                </p>

                <a href="workspace.php?id=<?php echo $workspace["workspace_id"]; ?>">
                    Open Workspace
                </a>

            </div>

            <hr>

        <?php endwhile; ?>

    <?php else: ?>

        <p>You don't have any workspaces yet.</p>

        <a href="create_workspace.php">
            Create a Workspace
        </a>

    <?php endif; ?>

    <br>

    <a href="create_workspace.php">
        Create Another Workspace
    </a>

    <br><br>

    <a href="logout.php">
        Logout
    </a>

</body>

</html>

<?php

$stmt->close();

?>