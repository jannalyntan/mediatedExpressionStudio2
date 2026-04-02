// setting up the active shape
let activeShape = null;

//resetting everything
let grabOffsetX = 0;
let grabOffsetY = 0;

//---------------------------------------------------------
// Sound System
//---------------------------------------------------------

//create a synth and connect it to the main output (your speakers)
const synth = new Tone.Synth().toDestination();

const pinkSound = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sine" },
  envelope: {
    attack: 1,
    decay: 1,
    sustain: 0.6,
    release: 4,
  },
});

const reverb = new Tone.Reverb({
  decay: 8,
  wet: 0.4,
}).toDestination();

synth.connect(reverb);

const now = Tone.now();

const colourNotes = {
  blue: ["D4", "F4", "A4"],
  yellow: ["G3", "B3", "D4"],
  pink: pinkSound,
  green: ["E3", "G3", "B3"],
};

function playSquares() {
  synth.triggerAttackRelease(colourNotes, "8n");
}

//---------------------------------------------------------
// Dragging functions
//---------------------------------------------------------
// https://www.w3schools.com/html/html5_draganddrop.asp main api for the drag and drop

function dragstartHandler(e) {
  // tracking which shape the user is dragging
  activeShape = e.target;
  activeShape.classList.add("dragging");

  //This is so that the code which 'square' is using the cursor at. I had to chatgpt this as I was stuck for quite a while.
  // I tried tracking the width and height but it was just not working.

  // Converting the width data set number into an actual number not a string. Using || 1 as a fallback in case it doesnt work
  const shapeWidth = Number(activeShape.dataset.width) || 1;

  // Getting the shape px
  const shapePixelWidth = activeShape.offsetWidth;

  // splitting it so to know where to place the shape
  const sectionWidth = shapePixelWidth / shapeWidth;

  // Converting the height data set number into an actual number not a string. Using || 1 as a fallback in case it doesnt work
  const shapeHeight = Number(activeShape.dataset.height) || 1;

  // Getting the shape px
  const shapePixelHeight = activeShape.offsetHeight;

  // splitting it so to know where to place the shape
  const sectionHeight = shapePixelHeight / shapeHeight;

  // where inside the shape the user grabbed width
  const x = e.offsetX;
  grabOffsetX = Math.floor(x / sectionWidth);

  // where inside the shape the user grabbed height
  const y = e.offsetY; //
  grabOffsetY = Math.floor(y / sectionHeight);

  // just in case, ensuring it won't work if the user clicks out of it
  if (grabOffsetX < 0) grabOffsetX = 0;
  if (grabOffsetX >= shapeWidth) grabOffsetX = shapeWidth - 1;

  if (grabOffsetY < 0) grabOffsetY = 0;
  if (grabOffsetY >= shapeHeight) grabOffsetY = shapeHeight - 1;

  console.log("shapeWidth:", shapeWidth);
  console.log("shapePixelWidth:", shapePixelWidth);
  console.log("sectionWidth:", sectionWidth);
  console.log("x:", x);
  console.log("grabOffsetX:", grabOffsetX);
}

// End of drag event
function dragendHandler(e) {
  e.target.classList.remove("dragging");
  activeShape.reset();

  activeShape = null;
}

// Based on the API guide
function dragoverHandler(ev) {
  ev.preventDefault();
}

function dropHandler(ev) {
  ev.preventDefault();
  console.log(activeShape);

  //making the dragged shape the
  const square = ev.currentTarget;
  if (!square || !activeShape) return;

  //tracking which square did the user drop the block on
  const dropRow = Number(square.dataset.row);
  const dropCol = Number(square.dataset.col);

  //Tracking the number of squares the block needs
  const shapeWidth = Number(activeShape.dataset.width) || 1;
  const shapeHeight = Number(activeShape.dataset.height) || 1;

  // adjust start position based on which part of the shape was grabbed,
  // via calculating square it is on minus the position grabed, so it can calculate it
  // which squares will it occupy
  const startCol = dropCol - grabOffsetX;
  const startRow = dropRow - grabOffsetY;

  const cellsToFill = [];

  // runs to see whether the square is being taken and also if it can fit into the grid. I had to ChatGPT this part as well. I was stuck for a while.

  //runs the loop depending on how big the height and width is
  for (let r = 0; r < shapeHeight; r++) {
    for (let c = 0; c < shapeWidth; c++) {
      const targetRow = startRow + r;
      const targetCol = startCol + c;

      const targetCell = document.querySelector(
        `.square[data-row="${targetRow}"][data-col="${targetCol}"]`,
      );

      // outside the grid container, it will not work
      if (!targetCell) return;

      // occupied by another shape, no work
      if (
        targetCell.dataset.occupied === "true" &&
        targetCell.dataset.shapeId !== activeShape.id
      ) {
        return;
      }

      // Placed the targeted squares into the array
      cellsToFill.push(targetCell);
    }
  }

  clearShapeOccupation(activeShape.id);

  // place the shape into the first cell, making sure it is nicely placed within the square
  const firstCell = cellsToFill[0];
  firstCell.appendChild(activeShape);

  // I was struggling with letting the system placing the elements wrongly as before it,
  // hence I use Claude Ai to go back and forth to ask why is it not working and got the answer
  // where the system was not understanding the square size.

  // letting the system know how big is the square
  const cellSize = 100;
  const gap = 10;

  // calculate total width and height the shape should cover
  const totalWidth = shapeWidth * cellSize + (shapeWidth - 1) * gap;
  const totalHeight = shapeHeight * cellSize + (shapeHeight - 1) * gap;

  activeShape.style.position = "absolute";
  activeShape.style.top = "0";
  activeShape.style.left = "0";
  activeShape.style.width = `${totalWidth}px`;
  activeShape.style.height = `${totalHeight}px`;
  activeShape.style.margin = "0";
  activeShape.style.zIndex = "2";
  activeShape.style.opacity = "0.95";
  activeShape.style.transform = `rotate(0)`;

  // This is for when I want to play the sound
  cellsToFill.forEach((cell) => {
    cell.dataset.occupied = "true";
    cell.dataset.shapeId = activeShape.id;
    cell.classList.add("occupied");
  });
}

function clearShapeOccupation(shapeId) {
  document
    .querySelectorAll(`.square[data-shape-id="${shapeId}"]`)
    .forEach((cell) => {
      cell.dataset.occupied = "false";
      cell.dataset.shapeId = "";
      cell.classList.remove("occupied");
    });
}

//---------------------------------------------------------
// Moving the shape
//---------------------------------------------------------
//When the user starts to drag the shape, it will run the function

document.querySelectorAll(".square").forEach((square) => {
  square.addEventListener("dragover", dragoverHandler);
  square.addEventListener("drop", dropHandler);
});

//---------------------------------------------------------
// Randomsie the Shape in the Shape Container
//---------------------------------------------------------
function randomiseShapes() {
  const container = document.querySelector(".shape-container");
  const shapes = document.querySelectorAll(".shape");

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  shapes.forEach((shape) => {
    const shapeWidth = shape.offsetWidth;
    const shapeHeight = shape.offsetHeight;
    const shapeZIndex = shape.zIndex;

    // random position (keeps shape inside container)
    const maxX = containerWidth - shapeWidth;
    const maxY = containerHeight - shapeHeight;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    // random rotation
    const rotation = (Math.random() - 0.5) * 20;

    const zIndex = Math.floor(Math.random() * 10);

    shape.style.left = `${x}px`;
    shape.style.top = `${y}px`;
    shape.style.transform = `rotate(${rotation}deg)`;
  });
}

function spawnShapes() {
  const container = document.querySelector(".shape-container");
  const originals = document.querySelectorAll(".shape");

  const colours = [
    "var(--blue)",
    "var(--pink)",
    "var(--green)",
    "var(--yellow)",
  ];

  originals.forEach((shape) => {
    // create multiple copies of each shape
    const copies = Math.floor(Math.random() * 6);

    for (let i = 0; i < copies; i++) {
      const clone = shape.cloneNode(true);

      // remove duplicate IDs (VERY IMPORTANT)
      clone.removeAttribute("id");

      // 🎨 assign random colour
      const randomColour = colours[Math.floor(Math.random() * colours.length)];

      clone.style.setProperty("--shape-color", randomColour);

      container.appendChild(clone);
    }
  });
}

window.addEventListener("load", () => {
  spawnShapes();
  randomiseShapes();
});
