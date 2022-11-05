// Create the video player
const videoPlayer = document.createElement("video");

// Find the buttom element by its ID
const videoButton = document.getElementById("videoButton");

// Initialize playing state
var playing = false;

videoButton.addEventListener("click", function() {
    // Check if video is currently playing using the playing variable
    if (playing) {// If it is, pause and hide the video
        // Removes the upscale class
        videoButton.classList.remove("sizeUp");

        // Creates an event listener for when the transition is over
        videoButton.addEventListener("transitionend", function() { // Executes when the transition ends
            // Pauses the video
            videoPlayer.pause();

            // Removes the video from the parent element
            videoButton.removeChild(videoPlayer);

            // Sets the button to "Click me"
            videoButton.innerHTML = "Click me";

            // Sets the playing state to false
            playing = false;
        }, {once: true});
        
    } else {// If it isn't, play and show the video

        // Sets the button to "Loading..."
        videoButton.innerHTML = "Loading...";

        // Set the source of the video, url to save space :D
        videoPlayer.src = "https://ia801602.us.archive.org/11/items/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4";

        // Play the video
        videoPlayer.play();

        // Creates an event listener for when the video starts playing
        videoPlayer.addEventListener("playing", function() {
            // Sets the button to nothing
            videoButton.innerHTML = "";
            // Adds the video to the button
            videoButton.appendChild(videoPlayer);
            // Adds the upscale class, causing a transition to occur
            videoButton.className = "sizeUp";

            // Sets the playing state to true
            playing = true;
        }, {once: true});
    }
});