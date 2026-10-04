<?php

require_once "qrcode/src/QRCode.php";

use chillerlan\QRCode\QRCode;

$data = "AssetTrack Test";

$qr = (new QRCode())->render($data);

?>

<!DOCTYPE html>
<html>

<head>
    <title>AssetTrack QR Test</title>
</head>

<body>

<h1>AssetTrack QR Test</h1>

<p>QR Code:</p>

<img src="<?php echo $qr; ?>" alt="QR Code">

</body>

</html>