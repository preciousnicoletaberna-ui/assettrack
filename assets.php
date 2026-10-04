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

if ($result->num_rows != 1) {
    echo "Workspace not found.";
    exit();
}

$workspace = $result->fetch_assoc();

$stmt->close();


// Get all assets in this workspace
$sql = "SELECT asset_id, asset_name, asset_number, category, location, status
        FROM assets
        WHERE workspace_id = ?
        ORDER BY asset_id ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $workspace_id);
$stmt->execute();

$assets = $stmt->get_result();

?>

<!DOCTYPE html>
<html>

<head>

    <title>
        AssetTrack - Assets
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

    <h2>Assets</h2>

    <a href="add_asset.php?id=<?php echo $workspace_id; ?>">
        Generate More Assets
    </a>

    <br><br>

    <?php if ($assets->num_rows > 0): ?>

        <table border="1" cellpadding="8">

            <tr>

                <th>Asset ID</th>
                <th>Asset Name</th>
                <th>Asset Number</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>

            </tr>

            <?php while ($asset = $assets->fetch_assoc()): ?>

                <tr>

                    <td>
                        <?php echo htmlspecialchars($asset["asset_id"]); ?>
                    </td>

                    <td>
                        <?php echo htmlspecialchars($asset["asset_name"]); ?>
                    </td>

                    <td>
                        <?php echo htmlspecialchars($asset["asset_number"]); ?>
                    </td>

                    <td>
                        <?php echo htmlspecialchars($asset["category"]); ?>
                    </td>

                    <td>
                        <?php echo htmlspecialchars($asset["location"]); ?>
                    </td>

                    <td>
                        <?php echo htmlspecialchars($asset["status"]); ?>
                    </td>

                </tr>

            <?php endwhile; ?>

        </table>

    <?php else: ?>

        <p>
            No assets have been added yet.
        </p>

    <?php endif; ?>

    <br>

    <a href="workspace.php?id=<?php echo $workspace_id; ?>">
        Back to Workspace
    </a>

    <br><br>

    <a href="dashboard.php">
        Back to Dashboard
    </a>

</body>

</html>

<?php

$stmt->close();

?>