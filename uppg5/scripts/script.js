let screenData = "Welcome to the Calculator!";
const screenDiv = document.getElementById("calc-text");
const resultDiv = document.getElementById("result-text");
let ans = 0;
let newResult = true;

function buttonClick(num) {
  // If the screen was just updated with a result, clear it on next input
  if (newResult) {
    newResult = false;
    /* QoL, to prevent beginning the calculation with + etc., automatically put the last answer before it */
    if (isNaN(num) && num !== "ans") {
      screenData = "ans";
    } else {
      screenData = "";
    }
  }
  // Add the inputted number onto the screen
  screenData += num;
  updateScreen();
}

function functionClick(func) {
  if (func === "CLEAR") {
    // Clears the screen
    screenData = "";
    updateScreen();
  } else if (func === "DEL") {
    // Deletes the last character
    if (screenData[screenData.length - 1] === "s") {
      screenData = screenData.slice(0, -3);
    } else {
      screenData = screenData.slice(0, -1);
    }
    updateScreen();
  } else if (func === "RESULT") {
    // Calculates the result
    // Replace ^ with the programmatic equivalent
    screenData = screenData.replaceAll("^", "**");
    // Use the eval function to evauluate a string, since user input is limited to numbers and operators, this should be quite safe lol
    ans = eval(screenData);
    // Update the screen data and result
    screenData = ans + "";
    updateResult();
    updateScreen();
    // set the newResult bool to true so the next input will clear the screen
    newResult = true;
  }
}

// Update the screen
function updateScreen() {
  screenDiv.innerText = screenData;
}

// Update the result screen
function updateResult() {
  resultDiv.innerText = "ANS = " + ans;
  resultDiv.title = ans;
}

// Copy the result to the clipboard
resultDiv.addEventListener("click", () => {
  navigator.clipboard.writeText(ans);
});

// Close the calculator, you can bring it back by adding external features to do so.
function closeCalc() {
  document.getElementById("calc").style.display = "none";
}

// When all the scripts are loaded, update the screen
updateScreen();
