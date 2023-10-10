![bruh-clips logo](web/images/logo.png "bruh-clips") 
# bruh-clips - Time Limited Video Sharing
 This project aimed at creating a lightweight and easy platform to share videos and clips with your friends. After uploading a clip, a new page is generated and makes the video available to watch for 48 hours, after which the page and the video file are deleted.

 I like the idea of [pastebin](https://pastebin.com) and wanted something similar for videos, since most of the clips I wanted to share were too large for chat applications like Discord.

 The first idea inlcuded to let the user chose how long the video should be available, but to keep the system minimal, a simple cron job just scrubs every page and video older than 48 hours.

Check out the website at [bruh-clips.com](https://bruh-clips.com).

 ## Deployment
 Coded in vanilla JavaScript, HTML and PHP, this project does not need any special deployment procedure or dependencies. Just put all the content of the "web" folder on a webserver and point a domain at it.

However, you need to change some things if you want to host your own version:

 1. The two php files [upload.php](web/upload.php) and [process-video.php](web/process-video.php) use absolute paths to configure the location of the `FFmpeg` binary and the domain of the website (currently pointing at [bruh-clips.com](https://bruh-clips.com)). 
 2. All `.html` files are currently branded in the [bruh-clips.com](https://bruh-clips.com)) design. You might want to change this and the corresponding metadata tags.
 3. Set up the [cron job](cleanup.sh) manually with your hoster/web server. This job takes care of deleting all uploaded content after 48 hours.

 ## Procedure
 1. The user selects a valid video file (currently set to: only .mp4 and max. 500mb) from his system and clicks on upload.
 2. [home.js](web/js/home.js) takes the video and snaps a frame at the end of the video (duration * 0.90) to use as a thumbnail.
 3. The file is transmitted to the server using a XMLHttpRequest.
 4. [upload.php](web/upload.php) handles the server-side validation and entire upload process:

    - Valdiate the video file and check if the webserver still has enough space left. If any validation step fails, the script will return an error message to be displayed.
    - Generate a random ID to use for the videofile, generated thumbnail and new HTML page.
    - Build together a new HTML page using the [template.html](web/extra/template.html).
    - Process the uploaded video with [FFmpeg](https://ffmpeg.org/) to allow for a faster buffering and loading time.
    - Redirect the user to the new page after processing is complete.
5. The user lands on the new page and can copy the link to share it. Thumbnail and videoname will be used in the link preview on any social media which supports the [Open Graph Protocol](https://ogp.me/).
6. 48 hours after uploading, the cron job will delete thumbnail, videofile and HTML page from the server. All visitors after that will be redirected to a [404 page](web/404.html).

 ## ToDos
 1. Add a file name input field to allow for a renaming of the clip before uploading.
 2. Integrate the possibility to cut/trim a clip before uploading using ffmpeg and server-side rendering.
 3. Set up CI/CD for this repository to publish changes directly to [bruh-clips.com](https://bruh-clips.com).

 (not in that order)