// File variable for future use
file = null;

// JavaScript for disabling form submissions if there are invalid fields 
/*(function () {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var form = document.getElementById("uploadForm")

    // Prevent submission
    form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
        } else{
            startUpload();
        }

        form.classList.add('was-validated')
    }, false)

})()*/

// Simple client side validation of file size
function checkFile(videoFile) {
    closeFileToBigAlert();

    var byteSize = videoFile[0].size;
    var mb = ((byteSize / 1024) / 1024).toFixed(4); // Size in MB
    if (mb > 500) {
        document.getElementById("fileToUpload").value = "";
        document.getElementById("fileToBigWarning").style.display = "block";
    } else {
        //document.getElementById("file-name-info").innerHTML = "Selected: " + videoFile[0].name;
        //document.getElementById("file-name-info").style.display = "block";
        //document.getElementById("fileToUpload").files = videoFile;
        file = videoFile[0];
    }
}

// Close the alert message of file to big
function closeFileToBigAlert() {
    document.getElementById("fileToBigWarning").style.display = "none";
    document.getElementById("fileToUpload").focus();
}

// Drag and Drop on Upload Form
let dropArea = document.getElementById("drop-area");
;["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
})

    ;["dragenter", "dragover"].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false)
    })

    ;["dragleave", "drop"].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false)
    })

dropArea.addEventListener("drop", handleDrop, false);

function handleDrop(e) {
    checkFile(e.dataTransfer.files);
    document.getElementById("fileToUpload").files = e.dataTransfer.files;
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    dropArea.classList.add("highlight");
}

function unhighlight(e) {
    dropArea.classList.remove("highlight");
}

// Event listener on the upload form to trigger in a submit event
//async function startUpload() {
document.getElementById("uploadForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    //if(!valid)
        //return

    //console.log("Triggered Upload AJAX");

    // Disable upload button and file select field
    document.getElementById("fileToUpload").setAttribute("disabled", "");
    document.getElementById("uploadButton").setAttribute("disabled", "");
    document.getElementById("fileSelectButton").setAttribute("disabled", "");

    // Show progress bar and status message
    document.getElementById("status").style = "display: block;";
    document.getElementById("progress-wrapper").style = "display: block;";

    // Get the file - redundant since file is now saved in a variable on drop/file select
    //var file = document.getElementById("fileToUpload").files[0];

    // Create FormData object and append file as "file"
    var formData = new FormData();
    formData.append("file", file);

    // Generate a thumbnail and add to form data
    const cover = await getVideoCover(file);
    formData.append("thumb", cover);

    // Debug: Display the key/value pairs of the formData
    /*
    for (var pair of formData.entries()) {
        console.log(pair[0] + ', ' + pair[1]);
    }*/

    // Create XMLHttpRequest object
    var ajax = new XMLHttpRequest();

    // Handle what happens on progress
    ajax.upload.onprogress = function (event) {
        // Update loaded x of n, round to MB with two decimals TODO: MB calculation is off/to large
        //document.getElementById("status").innerHTML = "Uploaded " + Math.round((event.loaded / 1000 / 1000 + Number.EPSILON) * 100) / 100 + " megabytes of " + Math.round((event.total / 1000 / 1000 + Number.EPSILON) * 100) / 100;
        document.getElementById("status").innerHTML = "Uploaded " + (((event.loaded - cover.size) / 1024) / 1024).toFixed(2) + " megabytes of " + (((event.total - cover.size) / 1024) / 1024).toFixed(2);

        // Calculate percentage
        var percent = (event.loaded / event.total) * 100;

        // Insert percentage number into progress bar
        var bar = document.getElementById("upload-progress");
        bar.setAttribute("aria-valuenow", Math.round(percent));
        bar.setAttribute("style", "width: " + Math.round(percent) + "%");
        bar.innerHTML = Math.round(percent) + "%";
    }

    // Handle what happens on abort
    ajax.onabort = function (e) {
        document.getElementById("status").innerHTML = "Upload Aborted";
    }

    // Handle what happens on error
    ajax.onerror = function (e) {
        document.getElementById("status").innerHTML = "Upload Failed";
    }

    // Handle what happens on load
    ajax.onload = function (e) {
        if (ajax.status >= 200 && ajax.status <= 299) {
            //console.log(ajax.responseText);
            var response = JSON.parse(ajax.responseText);
            if (response.error) {
                document.getElementById("status").innerHTML = "<b>Server-Side Errors:</b> <br>" + response.error + "<b> Please try to resolve the errors or contact us at info@bruh-clips.com";
            } else if (response.location) {
                window.location.href = response.location;
            }
        }
    }

    // Open upload.php and send POST request
    ajax.open("POST", "upload.php");
    ajax.send(formData);
});


// Generate a thumbnail for the video file
function getVideoCover(file) {
    //console.log("getting video cover for file: ", file);
    return new Promise((resolve, reject) => {
        // load the file to a video player
        const videoPlayer = document.createElement('video');
        videoPlayer.setAttribute('src', URL.createObjectURL(file));
        videoPlayer.load();
        videoPlayer.addEventListener('error', (ex) => {
            reject("error when loading video file", ex);
        });
        // load metadata of the video to get video duration and dimensions
        videoPlayer.addEventListener('loadedmetadata', () => {
            // delay seeking or else 'seeked' event won't fire on Safari
            setTimeout(() => {
                videoPlayer.currentTime = videoPlayer.duration * 0.9;
            }, 200);
            // extract video thumbnail once seeking is complete
            videoPlayer.addEventListener('seeked', () => {
                //console.log('video is now paused at %ss.', seekTo);
                // define a canvas to have the same dimension as the video
                const canvas = document.createElement("canvas");
                canvas.width = videoPlayer.videoWidth;
                canvas.height = videoPlayer.videoHeight;
                // draw the video frame to canvas
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                // return the canvas image as a blob
                ctx.canvas.toBlob(
                    blob => {
                        resolve(blob);
                    },
                    "image/jpeg",
                    0.75 // quality 
                );
            });
        });
    });
}

// Helper for fading out elements
function fadeout(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1) {
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 10);
}

// Helper for fading in elements
function fadein(element) {
    var op = 0.1;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1) {
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
}