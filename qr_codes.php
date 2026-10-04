<?php

use GlobusStudio\QRCode\QRCode;

session_start();

require_once "config/database.php";
require_once __DIR__ . "/vendor/autoload.php";

if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION["user_id"];

if (!isset($_GET["id"]) || !isset($_GET["count"])) {
    header("Location: dashboard.php");
    exit();
}

$workspace_id = intval($_GET["id"]);
$asset_count = intval($_GET["count"]);

/* Make sure the workspace belongs to the logged-in user */

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

/* Get the newest generated assets */

$sql = "SELECT asset_id, asset_name, asset_number, category, location
        FROM assets
        WHERE workspace_id = ?
        ORDER BY asset_id DESC
        LIMIT ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $workspace_id, $asset_count);
$stmt->execute();

$result = $stmt->get_result();

$assets = [];

while ($asset = $result->fetch_assoc()) {
    $assets[] = $asset;
}

$stmt->close();

/* Reverse the order so the oldest generated asset appears first */

$assets = array_reverse($assets);

?>

<!DOCTYPE html>
<html>

<head>

    <title>AssetTrack - QR Codes</title>

</head>

<body>

<h1>AssetTrack</h1>

<h2>Generated QR Codes</h2>

<p>
    Workspace:
    <?php echo htmlspecialchars($workspace["workspace_name"]); ?>
</p>

<p>
    Workspace Code:
    <?php echo htmlspecialchars($workspace["workspace_code"]); ?>
</p>

<hr>

<?php if (count($assets) > 0): ?>

    <?php foreach ($assets as $asset): ?>

        <?php

        /*
         * This is the page that the QR code
         * will open when scanned.
         */

        $qr_data =
            "http://localhost/assettrack/report.php?asset_id=" .
            $asset["asset_id"];

        $qr_svg = QRCode::svg($qr_data);

        ?>

        <div>

            <h3>
                <?php echo htmlspecialchars($asset["asset_name"]); ?>
            </h3>

            <p>
                Asset Number:
                <?php echo htmlspecialchars($asset["asset_number"]); ?>
            </p>

            <p>
                Category:
                <?php echo htmlspecialchars($asset["category"]); ?>
            </p>

            <p>
                Location:
                <?php echo htmlspecialchars($asset["location"]); ?>
            </p>

            <?php echo $qr_svg; ?>

            <p>
                Scan URL:
                <?php echo htmlspecialchars($qr_data); ?>
            </p>

        </div>

        <hr>

    <?php endforeach; ?>

<?php else: ?>

    <p>No assets found.</p>

<?php endif; ?>

<br>

<a href="assets.php?id=<?php echo $workspace_id; ?>">
    Back to Assets
</a>

<br><br>

<a href="workspace.php?id=<?php echo $workspace_id; ?>">
    Back to Workspace
</a>

</body>

</html>