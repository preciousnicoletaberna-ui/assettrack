<?php

session_start();

// Remove all session data
session_unset();

// Destroy the session
session_destroy();

// Send the user back to login
header("Location: login.php");
exit();

?>