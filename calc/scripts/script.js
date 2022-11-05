// Get all the divs that will be used
const screenDiv = document.getElementById("calc-text");
const resultDiv = document.getElementById("result-text");
const graphDiv = document.getElementById("graph-body");
const calcDiv = document.getElementById("calc");

// Variables used for graphing, gets the canvas and the context of it
const canvas = document.getElementById("graph");
const xWidthDiv = document.getElementById("x-width");
const yHeightDiv = document.getElementById("y-width");
const ctx = canvas.getContext("2d");

// Generally allowed keyboard buttons without further functionality
const allowedButtons = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "-",
  "*",
  "/",
  "^",
  ".",
  ",",
  "(",
  ")",
  "x",
];

// Boolean to see if the calculator screen should reset on the next input
let newResult = true;
// String for the data that is currently on the screen
let screenData = "Welcome to the Calculator!";

// Variable for the calculated answer
let ans = 0;

// The index where the cursor is at, -1 if not in cursor mode
let cursorIndex = -1;
// Boolean to see if the calculator is in cursor mode
let cursorMode = false;

// Boolean to check whether to display an underscore at the cursor or not
let underscore = false;

// Different states of the calculator, graph mode or normal mode
let graphState = false;
// Boolean to check if webassembly is enabled
let wasmMode = false;

// Imports a rust written function to draw graphs using webassembly
const { draw_fast } = wasm_bindgen;
async function importWasm() {
  await wasm_bindgen("./wasm/eval_bg.wasm");
}

importWasm();

// Button to toggle between wasm mode, which is faster, and javascript mode.
function toggleWasm() {
  wasmMode = !wasmMode; // Inverse boolean
  if (wasmMode) {
    document.getElementById("wasm-button").innerText = "🚀";
  } else {
    document.getElementById("wasm-button").innerText = "🐢";
  }
}

// Function to place a character at a certain index of a string
function placeAtCursor(char) {
  // If cursormode is off, simply add the char to end of string
  if (!cursorMode) return screenData + char;
  // Move cursorindex by chars length
  let res =
    screenData.substring(0, cursorIndex) +
    char +
    screenData.substring(cursorIndex);
  cursorIndex += char.length;
  return res;
}

// Function that moves the cursor left or right
function cursorMove(dir) {
  // You should not be able to enter cursor mode on a new result
  if (newResult) return;

  // If the cursor is not in cursor mode, enter cursor mode at end of screen
  if (!cursorMode) {
    cursorMode = true;
    if (!dir) {
      cursorIndex = screenData.length;
    } else {
      cursorIndex = -1;
    }
  }

  // Moves the cursor left and right, if ans is selected, move 3 characters
  if (dir) {
    if (screenData[cursorIndex + 1] === "n") {
      cursorIndex += 3;
    } else {
      cursorIndex += 1;
    }
  } else {
    if (screenData[cursorIndex - 1] === "s") {
      cursorIndex -= 3;
    } else {
      cursorIndex -= 1;
    }
  }

  // Exit cursor mode if the cursor moves past end of screen
  if (cursorIndex < 0) {
    cursorIndex = -1;
    cursorMode = false;
  } else if (cursorIndex > screenData.length - 1) {
    cursorMode = false;
    cursorIndex = -1;
  }
  updateScreen();
}

// Indicates where the cursor is by adding a blinking underscore to the screen
setInterval(() => {
  underscore = !underscore;
  updateScreen();
}, 300);

// Function to handle generic button inputs
function buttonClick(num) {
  // If the screen was just updated with a result or the screen is empty, clear it on next input
  if (newResult || screenData === "") {
    newResult = false;
    /* QoL, to prevent beginning the calculation with + etc., automatically put the last answer before it */
    if (isNaN(num) && num !== "ans") {
      screenData = "ans";
    } else {
      screenData = "";
    }
  }
  // Add the inputted number onto the screen
  screenData = placeAtCursor(num);
  updateScreen();
}

// Function to handle more complex buttons
function functionClick(func) {
  switch (func) {
    case "CLEAR":
      {
        // Clear the screen
        screenData = "";
        cursorMode = false;
        cursorIndex = -1;
      }
      break;
    case "DEL":
      {
        // If cursormode is on
        if (cursorMode) {
          // If ans is going to be deleted, delete 3 characters
          let x = 1;
          if (screenData[cursorIndex - 1] === "s") x = 3;
          // Delete the character at the cursor
          screenData =
            screenData.substring(0, cursorIndex - x) +
            screenData.substring(cursorIndex);
          // Move cursor accordingly
          cursorIndex -= x;
        } else {
          // Deletes the last character, if the last feature is ans, delete three characters
          if (screenData[screenData.length - 1] === "s") {
            screenData = screenData.slice(0, -3);
          } else {
            screenData = screenData.slice(0, -1);
          }
        }
      }
      break;
    case "RESULT":
      {
        // Check if the calculator is in graph mode to see if it should calculate a result or draw a graph
        if (graphState) {
          calcGraph(screenData); // Draw graph
        } else {
          getResult(); // Calculate result
        }
        cursorMode = false;
        cursorIndex = -1;
      }
      break;
    case "GRAPHMODE":
      {
        // Toggle between graph mode and normal mode
        if (graphState) {
          graphDiv.style.display = "none";
          calcDiv.style.borderRadius = "5px";
        } else {
          graphDiv.style.display = "flex";
          calcDiv.style.borderRadius = "5px 0 5px 5px";
        }
        graphState = !graphState;
      }
      break;
  }
  updateScreen();
}

function getResult() {
  try {
    // Create a copy of the screen data
    let copyData = screenData;
    // Replace ^ with the programmatic equivalent
    copyData = copyData.replaceAll("^", "**");
    // Replace the decimal separator , with the programmatic standard .
    copyData = copyData.replaceAll(",", ".");

    // If the function has parentheses with no operator (e.g. 2(3+4)), default to the multiplication operator
    // Iterate through all characters in the function
    for (let i = 0; i < copyData.length; i++) {
      if (copyData[i] === "(" && !isNaN(copyData[i - 1])) {
        // If the character is a ( and the previous character is a number
        copyData = copyData.slice(0, i) + "*" + copyData.slice(i); // Add a * inbetween the number and the (
      } else if (copyData[i] === ")" && !isNaN(copyData[i + 1])) {
        // If the character is a ) and the next character is a number
        copyData = copyData.slice(0, i + 1) + "*" + copyData.slice(i + 1); // Add a * inbetween the ) and the number
      }
    }

    // Try to evaluate the function, if the syntax is invalid, throw an error.
    try {
      ans = eval(copyData);
    } catch {
      throw "Invalid function";
    }
    // If the result is undefined, throw an error
    if (isNaN(ans) || ans === Infinity) {
      throw "Number too big or undefined!";
    }
    // Update the screen data and result
    screenData = ans + "";
    updateResult();
    updateScreen();
    // set the newResult bool to true so the next input will clear the screen
    newResult = true;
  } catch (e) {
    alert(`Error: ${e}`); // If an error occurs, alert the user
  }
}

// Update the screen
function updateScreen() {
  // If the screen is displaying a result or an underscore should not be displayed, simply display the screen data
  if (newResult) return (screenDiv.innerText = screenData);
  if (!underscore) return (screenDiv.innerText = screenData);
  // Default char length is 1, if ans is selected, the length is 3
  let x = 1;
  if (screenData[cursorIndex] === "a") x = 3;
  // If cursor mode is on, select the correct character(s), if not, add a blankspace character at EOL
  if (cursorMode) {
    screenDiv.innerHTML =
      screenData.substring(0, cursorIndex) +
      "<u>" +
      screenData.substring(cursorIndex, cursorIndex + x) +
      "</u>" +
      screenData.substring(cursorIndex + x);
  } else {
    screenDiv.innerHTML = screenData + "<u>&nbsp</u>";
  }
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

// Initialize the graph screen with lines to indicate the x and y axis
function initializeGraphScreen() {
  // Clear screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.strokeStyle = "rgb(0, 0, 0)";
  ctx.lineWidth = 2;
  // Draw y axis
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  // Draw x axis
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.strokeStyle = "rgb(0, 0, 0)";
  ctx.lineWidth = 2;
  // Draw lines on the x axis
  for (let i = 0; i <= canvas.width; i += 10) {
    ctx.moveTo(i, canvas.height / 2 - 5);
    ctx.lineTo(i, canvas.height / 2 + 5);
  }
  // Draw lines on the y axis
  for (let i = 0; i <= canvas.height; i += 10) {
    ctx.moveTo(canvas.width / 2 - 5, i);
    ctx.lineTo(canvas.width / 2 + 5, i);
  }
  // Draw the lines
  ctx.stroke();
  ctx.closePath();
}

// Draw the graph
function calcGraph(func) {
  let start = performance.now();
  // Fix the function to be compatible with the eval function
  func = fixFunc(func, true);
  // Clear the screen
  initializeGraphScreen();
  // Check if wasm mode is on, if it is, use the wasm function, otherwise use the js function
  if (wasmMode) {
    draw_fast(func, ans);
  } else {
    // Configurate the line style
    ctx.beginPath();
    let canvasHeight = canvas.height;
    let canvasWidth = canvas.width;
    let interval = canvasWidth / 10000;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    let x = (-canvasWidth / 2) * (xWidthDiv.value / 10);
    let y = -eval(func) / (yHeightDiv.value / 10) + canvasHeight / 2;
    ctx.moveTo(0, y);
    // Iterate through the screen and calculate points to draw using the specified function
    for (let i = 0; i <= canvasWidth; i += interval) {
      try {
        x += interval * (xWidthDiv.value / 10);
        y = -eval(func) / (yHeightDiv.value / 10) + canvasHeight / 2;
        if (y > canvasHeight * 2 || y < -canvasHeight) {
          throw "Number too big or undefined!";
        }
        // Draw line to new point and then move to the new point for the next iteration
        ctx.lineTo(i, y);

        ctx.moveTo(i, y);
      } catch (e) {}
    }
    // Draw all the lines that have been created
    ctx.stroke();
    ctx.closePath();
  }
  let end = performance.now();
  console.log(end - start);
}

function fixFunc(func) {
  // Replace potential _ with nothing
  func = func.replace("_", "");
  // Replace ^ with the programmatic equivalent, required for javascript eval but not the rust function
  if (!wasmMode) {
    func = func.replaceAll("^", "**");
  }
  // Replace the decimal separator , with the programmatic standard .
  func = func.replaceAll(",", ".");

  // If the function has parentheses or an x with no operator (e.g. 2(3+4)), default to the multiplication operator
  // Iterate through all characters in the function
  for (let i = 0; i < func.length; i++) {
    if (func[i] === "(" && !isNaN(func[i - 1])) {
      // If the character is a ( and the previous character is a number
      func = func.slice(0, i) + "*" + func.slice(i); // Add a * inbetween the number and the (
    } else if (func[i] === ")" && !isNaN(func[i + 1])) {
      // If the character is a ) and the next character is a number
      func = func.slice(0, i + 1) + "*" + func.slice(i + 1); // Add a * inbetween the ) and the number
    } else if (func[i] === "x") {
      if (!isNaN(func[i - 1])) {
        func = func.slice(0, i) + "*" + func.slice(i);
      }
      if (!isNaN(func[i + 1])) {
        func = func.slice(0, i + 1) + "*" + func.slice(i + 1);
      }
    }
  }
  return func;
}

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (!(document.getElementById("x-width") !== document.activeElement && document.getElementById("y-width") !== document.activeElement)) return;
  // Switch case to determine allowed keys together with the corresponding function
  switch (e.key) {
    case "ArrowRight":
      return cursorMove(true);
    case "ArrowLeft":
      return cursorMove(false);
    case "a":
      return buttonClick("ans");
    case "f":
      return functionClick("GRAPHMODE");
    case "w":
      return toggleWasm();
    case "Backspace":
      if (e.ctrlKey) {
        return functionClick("CLEAR");
      }
      return functionClick("DEL");
    case "Enter":
      return functionClick("RESULT");
    case "Escape":
      return functionClick("CLEAR");
    default:
      if (allowedButtons.includes(e.key)) {
        e.preventDefault();
        return buttonClick(e.key);
      }
  }
});

// When all the scripts are loaded, update the screen and initialize the graph screen
initializeGraphScreen();
updateScreen();
