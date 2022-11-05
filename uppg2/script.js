
// Find the buttom element by its ID
const button = document.getElementById("playButton");

// Create the playing status image and add it to the button
const playImage = document.createElement("img");
playImage.className = "playState";
playImage.src = "media/play_icon.png";
button.appendChild(playImage);

// Generate a number between 0 and 2 and play the corresponding audio file
const randomNumber = Math.floor(Math.random() * 3);
const player = new Audio(`media/${randomNumber}.mp3`);

// Initialize playing state
var playState = false;

// Event listener for on click on the element
button.addEventListener("click", function() {
    // Check if audio is currently playing using the playState variable
    if (playState) {
        // If it is, pause the audio
        playState = false;
        playImage.src = "media/play_icon.png";
        player.pause();
    } else {
        // If it isn't, play the audio
        playState = true;
        playImage.src = "media/pause_icon.png";
        player.play();
    }
});
