
function processVideo() {
    // Check if Video is already on page. If not, getElementById returns null
    var videoExists = document.getElementById("uploaded-video");

    if (videoExists == null) {
        // Get Page ID
        var url = window.location.href
        url = url.split("/");
        var id = url[url.length-1];
        console.log(id);

        // Create XMLHttpRequest object
        var ajax = new XMLHttpRequest();

        var formData = new FormData();
        formData.append("id", id);
        console.log("formdata:", formData);
        // Handle what happens on progress
        ajax.upload.onprogress = function (event) {

        }

        // Handle what happens on abort
        ajax.onabort = function (e) {
            document.getElementById("status").innerHTML = "Processing Aborted";
        }

        // Handle what happens on error
        ajax.onerror = function (e) {
            document.getElementById("status").innerHTML = "Processing Failed";
        }

        // Handle what happens on load
        ajax.onload = function (e) {
            if (ajax.status >= 200 && ajax.status <= 299) {
                //console.log(ajax.responseText);
                var response = JSON.parse(ajax.responseText);
                if (response.error) {
                    document.getElementById("status").innerHTML = "<b>Server-Side Errors:</b> <br>" + response.error + "<b> Please try to resolve the errors or contact us at info@bruh-clips.com";
                } else {
                    //window.location.href = response.location;
                    location.reload();
                }
            }
        }

        // Open process-video.php and send POST request
        ajax.open("POST", "../process-video.php");
        ajax.send(formData);
    }
}


