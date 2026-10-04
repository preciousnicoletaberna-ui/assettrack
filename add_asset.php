
<?php

session_start();

require_once "config/database.php";

if (!isset($_SESSION["user_id"])) {
    header("Location: login.php");
    exit();
}

$user_id = $_SESSION["user_id"];

if (!isset($_GET["id"])) {
    header("Location: dashboard.php");
    exit();
}

$workspace_id = intval($_GET["id"]);

/* Check if workspace belongs to logged-in user */

$sql = "SELECT workspace_id, workspace_name
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

$message = "";

/* Generate assets */

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $asset_type = trim($_POST["asset_type"]);
    $asset_count = intval($_POST["asset_count"]);
    $location = trim($_POST["location"]);

    if ($asset_count <= 0) {

        $message = "Please enter a valid number of assets.";

    } else {

        /* Create prefix */

        $prefix = strtoupper(
            substr(
                preg_replace(
                    "/[^A-Za-z0-9]/",
                    "",
                    $asset_type
                ),
                0,
                3
            )
        );

        /* Make sure prefix is not empty */

        if ($prefix == "") {
            $prefix = "AST";
        }

        /*
         * Find the highest existing number
         * for this workspace and prefix.
         */

        $sql = "SELECT asset_number
                FROM assets
                WHERE workspace_id = ?
                AND asset_number LIKE ?
                ORDER BY asset_id DESC
                LIMIT 1";

        $stmt = $conn->prepare($sql);

        $search_pattern = $prefix . "-%";

        $stmt->bind_param(
            "is",
            $workspace_id,
            $search_pattern
        );

        $stmt->execute();

        $result = $stmt->get_result();

        $next_number = 1;

        if ($result->num_rows > 0) {

            $last_asset = $result->fetch_assoc();

            /*
             * Example:
             * COM-048
             *
             * Extract 048
             */

            $last_number = intval(
                substr(
                    $last_asset["asset_number"],
                    4
                )
            );

            $next_number = $last_number + 1;
        }

        $stmt->close();

        $success = true;

        /*
         * Create each asset
         */

        for ($i = 0; $i < $asset_count; $i++) {

            $number = $next_number + $i;

            $asset_name =
                $asset_type . " " .
                str_pad(
                    $number,
                    2,
                    "0",
                    STR_PAD_LEFT
                );

            $asset_number =
                $prefix . "-" .
                str_pad(
                    $number,
                    3,
                    "0",
                    STR_PAD_LEFT
                );

            $category = $asset_type;

            $description =
                "Automatically generated " .
                $asset_type;

            $sql = "INSERT INTO assets
                    (
                        workspace_id,
                        asset_name,
                        asset_number,
                        category,
                        location,
                        description
                    )
                    VALUES (?, ?, ?, ?, ?, ?)";

            $stmt = $conn->prepare($sql);

            $stmt->bind_param(
                "isssss",
                $workspace_id,
                $asset_name,
                $asset_number,
                $category,
                $location,
                $description
            );

            if (!$stmt->execute()) {

                $success = false;

                $message =
                    "Error: " . $stmt->error;

                $stmt->close();

                break;
            }

            $stmt->close();
        }

        if ($success) {

            $first_number = $next_number;

            $last_number =
                $next_number +
                $asset_count -
                1;

            $message =
                $asset_count .
                " " .
                $asset_type .
                "(s) created successfully!";

            /*
             * Redirect after POST.
             *
             * This prevents the browser from
             * submitting the same form again
             * when refreshed.
             */

            header(
    "Location: qr_codes.php?id=" .
    $workspace_id .
    "&count=" .
    $asset_count .
    "&start=" .
    $first_number
);

exit();
        }
    }
}

/* Show success message after redirect */

if (isset($_GET["success"])) {
    $message = $_GET["success"];
}

?>

<!DOCTYPE html>
<html>

<head>

    <title>
        AssetTrack - Generate Assets
    </title>

</head>

<body>

<h1>AssetTrack</h1>

<h2>Generate Assets</h2>

<p>
    Workspace:
    <?php
    echo htmlspecialchars(
        $workspace["workspace_name"]
    );
    ?>
</p>

<?php if ($message != ""): ?>

    <p>
        <?php
        echo htmlspecialchars($message);
        ?>
    </p>

<?php endif; ?>

<hr>

<form method="POST">

    <label>Asset Type:</label>
    <br>

    <input
        type="text"
        name="asset_type"
        placeholder="Example: Computer"
        required
    >

    <br><br>

    <label>Number of Assets:</label>
    <br>

    <input
        type="number"
        name="asset_count"
        min="1"
        placeholder="Example: 48"
        required
    >

    <br><br>

    <label>Location:</label>
    <br>

    <input
        type="text"
        name="location"
        placeholder="Example: Computer Laboratory"
        required
    >

    <br><br>

    <button type="submit">
        Generate Assets
    </button>

</form>

<br>

<a href="assets.php?id=<?php echo $workspace_id; ?>">
    View Assets
</a>

<br><br>

<a href="workspace.php?id=<?php echo $workspace_id; ?>">
    Back to Workspace
</a>

</body>

</html>