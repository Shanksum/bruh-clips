<?php
/* TODO: For future DB implementations
// Database credentials
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "platform";

// Establish Connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
*/

// Enable PHP error reporting
error_reporting(E_ALL);
ini_set('display_errors', TRUE);

// Boolean to track upload checks
$uploadOk = 1;

// String to record all errors
$errorDump = "";

$allowed_files = [
  'video/mp4' => 'mp4'
];

// The file name
$fileName = $_FILES["file"]["name"];

// The video name without the .mp4
//$videoName = chop($fileName, ".mp4");
$videoName = pathinfo($fileName, PATHINFO_FILENAME);

// Videofile in the PHP tmp folder
$fileTmpLoc = $_FILES["file"]["tmp_name"];

// Undefined | Multiple Files | $_FILES Corruption Attack
// If this request falls under any of them, treat it invalid.
if (
  !isset($_FILES['file']['error']) ||
  is_array($_FILES['file']['error'])
) {
  $errorDump .= "[Error: Undefined/Multiple Files/File Corruption!]<br>";
  $uploadOk = 0;
}

// Allow certain file formats
$finfo = new finfo(FILEINFO_MIME_TYPE);
if (false === $ext = array_search(
  $finfo->file($fileTmpLoc),
  array(
    'mp4' => 'video/mp4'
  ),
  true
)) {
  $errorDump .= "[Error: The videofile is not in .mp4 format!]<br>";
  $uploadOk = 0;
}

// File size in bytes
$fileSize = $_FILES["file"]["size"];

define('KB', 1024);
define('MB', 1048576);
define('GB', 1073741824);

// Check file size
if ($fileSize > 500 * MB) {
  $errorDump .= "[Error: The file is larger than 500mb!]<br>";
  $uploadOk = 0;
}

// Target directories
$videoTargetDir = "uploads/";
$pageTargetDir = "clips/";

// Check if directoy still has enough space 
// Set to a limit of 40 GBs
if (folderSize($videoTargetDir) > 40 * GB) {
  $uploadOk = 0;
  $errorDump .= "[Error: Our server capacity is full! Please try again in ~two hours.]<br>";
}

function folderSize($dir)
{
  $size = 0;

  foreach (glob(rtrim($dir, '/') . '/*', GLOB_NOSORT) as $each) {
    $size += is_file($each) ? filesize($each) : folderSize($each);
  }

  return $size;
}

// Random ID for the page, thumbnail and the video to prevent duplicates
$newRandID = "";
do {
  $randomBytes = random_bytes(4);
  $newRandID = bin2hex($randomBytes);
} while (file_exists($videoTargetDir . $newRandID . ".mp4"));


// TODO: Maybe move thumbnails to images/ or thumbs/ for better sorting
//$thumbName = chop($newName, ".mp4").".jpeg";
//$thumbName = pathinfo($newRandID, PATHINFO_FILENAME).".jpeg";
//move_uploaded_file($_FILES["thumb"]["tmp_name"], "uploads/$newRandID.jpeg");

// Check if $uploadOk is set to 0 by an error
if ($uploadOk == 0) {
  echo json_encode(['error' => $errorDump]);
  exit;
  // if everything is ok ($uploadOk = 1), try to upload video and thumbnail
} else {
  if (move_uploaded_file($fileTmpLoc, "uploads/$newRandID.mp4") && move_uploaded_file($_FILES["thumb"]["tmp_name"], "uploads/$newRandID.jpeg")) {
    // Files uploaded successfully
  } else {
    echo json_encode(['error' => '[Error: move_upload_file failed. Please contact info@bruh-clips.com]<br>']);
    exit;
  }
}

// Create new page for the file
$newPage = file_get_contents("extra/template.html");

// Insert link to thumbnail
$newPage = str_replace("{%thumbLink%}", "https://bruh-clips.com/uploads/$newRandID" . ".jpeg", $newPage);

// Replace page title with video name
$newPage = str_replace("{%videoName%}", $videoName, $newPage);

// Prepare HTML string for insertion & Insert video
$insertFile = "<video style='width: 100%; height: 100%;' poster='../uploads/$newRandID.jpeg' playsinline='true' controls='true' preload='auto'><source src='../uploads/$newRandID-0.mp4' type='video/mp4'>Your browser does not support the video tag</video>";
$newPage = str_replace("{%insertFile%}", $insertFile, $newPage);

// Insert Link for Clipboard Copy
$newPage = str_replace("{%pageLink%}", "https://bruh-clips.com/clips/$newRandID", $newPage);

// Insert video file link for meta tags
$newPage = str_replace("{%videoFileLink%}", "https://bruh-clips.com/uploads/$newRandID-0.mp4", $newPage);

// Insert Download Button
$downloadButton = "<a class='btn btn-danger' href='../uploads/$newRandID-0.mp4' role='button' download='$fileName'><i class='bi bi-download'></i> Download Clip</a>";
$newPage = str_replace("{%insertButton%}", $downloadButton, $newPage);

// Calculate page expiry and insert
// Takes current timestamp and adds 2 days in seconds (2d * 24h * 60m *60s)
$expiryDate = time() + (2 * 24 * 60 * 60);
$newPage = str_replace("{%expiryDate%}", date('d. F Y H:00 e', $expiryDate), $newPage);

// Create new html page
if (file_put_contents("clips/$newRandID.html", $newPage) && $uploadOk == 1) {
  // Close DB connection
  //$conn->close();

  //shell_exec("ffmpeg -y public_html/uploads/$newRandID.mp4 public_html/uploads/$newRandID.mp4 </dev/null >/dev/null 2>/ffmpeg.log &");
  //shell_exec("/usr/home/bruhnc/ffmpeg -y -i uploads/$newRandID.mp4 uploads/$newRandID-0.mp4 </dev/null >/dev/null 2>/ffmpeg.log &");
  //shell_exec("/usr/home/bruhnc/ffmpeg -y -movflags +faststart -i uploads/$newRandID.mp4 uploads/$newRandID-0.mp4 >/dev/null 2>ffmpeg.log &");
  //echo shell_exec("/usr/home/bruhnc/qt-faststart -y ../uploads/$newRandID.mp4 ../uploads/$newRandID.mp4 2>&1");

  shell_exec("/usr/home/bruhnc/ffmpeg -y -i uploads/$newRandID.mp4 -c copy -map 0 -movflags +faststart uploads/$newRandID-0.mp4 > /dev/null 2> ffmpeg.log");
  unlink("uploads/$newRandID.mp4");

  // Redirect to new page
  header('Content-Type: application/json');
  echo json_encode(['location' => 'https://bruh-clips.com/clips/' . $newRandID]);
  exit;
} else {
  echo json_encode(['error' => '[Error: Video page creation failed. Please contact info@bruh-clips.com]<br>']);
  exit;
}
exit;
