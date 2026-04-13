// tracking the shapes
let activeShape = null;
let droppedOnGrid = false;
let grabOffsetX = 0;
let grabOffsetY = 0;

// Placing the Cell size
const CELL_SIZE = 100;
const GAP = 10;

// Css Colour Name
const colours = {
  "var(--blue)": "blue",
  "var(--pink)": "pink",
  "var(--green)": "green",
  "var(--yellow)": "yellow",
};

const rowPitches = {
  blue: ["C4", "A3", "G3", "E3", "D3", "C2"],
  pink: ["C7", "A6", "G6", "E6", "D6", "C5"],
  green: ["C6", "A5", "G5", "E5", "D5", "C4"],
  yellow: ["C6", "A5", "G5", "E5", "D5", "C4"],
};

//---------------------------------------------------------
// Audio
//---------------------------------------------------------
document.addEventListener(
  "click",
  async () => {
    await Tone.start();
  },
  { once: true },
);

const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.15 }).toDestination();
//After testing I realised I had to use the polysynth to get it to play together otherwise there would be an error
//Testing this out wanted it to be a drum sound, similar to the a toy drum
const drumSynth = new Tone.PolySynth(Tone.MembraneSynth, {
  pitchDecay: 0.02,
  octaves: 2,
  oscillator: { type: "sine" },
  envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.2 },
  volume: -8,
}).connect(reverb);

//Wanting this to sound like a piano
const pinkSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.6 },
  volume: -6,
}).connect(reverb);

// I want it to sound like a triangle 'ding' sound
const greenSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.2 },
  volume: -10,
}).connect(reverb);

//I didn't know what sound to make this sound like so I made it sound as high pitch as possible and more kid like, similar to those fake drum set
const yellowSynth = new Tone.PolySynth(Tone.FMSynth, {
  harmonicity: 4,
  modulationIndex: 12,
  envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
  modulation: { type: "square" },
  modulationEnvelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
  volume: -2,
}).connect(reverb);

// Recording the sound notes
const colourPatterns = {
  blue: ["kick", "snare", "kick"],
  pink: ["C6", "E6", "G6"],
  green: ["C6"],
  yellow: ["G5", "B5", "D6"],
};

// Used when dropping a shape manually onto the grid
function playColourSound(colourName, row) {
  const note = rowPitches[colourName]?.[row];
  const now = Tone.now();

  if (!note) return;

  if (colourName === "blue") {
    drumSynth.triggerAttackRelease(note, "16n", now);
    drumSynth.triggerAttackRelease(note, "16n", now + 0.12);
    drumSynth.triggerAttackRelease(note, "16n", now + 0.24);
    return;
  }

  if (colourName === "pink") {
    pinkSynth.triggerAttackRelease(note, "8n", now);
    return;
  }

  if (colourName === "yellow") {
    yellowSynth.triggerAttackRelease(note, "16n", now);
    return;
  }

  if (colourName === "green") {
    greenSynth.triggerAttackRelease(note, "8n", now);
    return;
  }
}

// Used by the looper — pitch determined by row position
function playRowSound(colourName, row, time) {
  const note = rowPitches[colourName][row];

  if (colourName === "blue") {
    drumSynth.triggerAttackRelease(note, "16n", time);
    drumSynth.triggerAttackRelease(note, "16n", time + 0.12);
    drumSynth.triggerAttackRelease(note, "16n", time + 0.24);
    return;
  }
  if (colourName === "pink") {
    pinkSynth.triggerAttackRelease(note, "8n", time);
    return;
  }
  if (colourName === "yellow") {
    yellowSynth.triggerAttackRelease(note, "16n", time);
    return;
  }
  if (colourName === "green") {
    greenSynth.triggerAttackRelease(note, "8n", time);
    return;
  }
}
//---------------------------------------------------------
// Helpers
//---------------------------------------------------------

function gridToPixels(cells) {
  return cells * CELL_SIZE + (cells - 1) * GAP;
}

//---------------------------------------------------------
// Spawn
//---------------------------------------------------------

// I didn't want to fully type of the shape as well as I wanted it to be randomise so
//  people can contantly create different sounds and loops.
function spawnShapes() {
  const container = document.querySelector(".shape-container");
  //seperated this from the others as I didn't want that many bridges
  const bridge = document.querySelector("#bridge");
  //linking up the orginals shapes
  const originals = [
    document.querySelector("#rectangle"),
    document.querySelector("#triangle"),
    document.querySelector("#circle"),
    bridge,
  ].filter(Boolean);

  // the different colours from the css
  const colours = [
    "var(--blue)",
    "var(--pink)",
    "var(--green)",
    "var(--yellow)",
  ];

  //this was to duplicate the different shapes, making it its own id and solid object
  originals.forEach((shape) => {
    //ensuring that there is only 2 bridge
    const copies = shape === bridge ? 2 : 6;
    for (let i = 0; i < copies; i++) {
      //cloning all the items inside that section, copying the shape entirely
      const clone = shape.cloneNode(true);

      //removing the orginial ID to create a new one
      clone.removeAttribute("id");

      //creating a new id for the shape
      clone.dataset.shapeId = `shape-${Date.now()}-${Math.random()}`;

      //changing the colour of the shape
      const randomColour = colours[Math.floor(Math.random() * colours.length)];
      clone.style.setProperty("--shape-color", randomColour);
      clone.dataset.colour = randomColour;

      //ensuring the shape is draggable
      clone.addEventListener("dragstart", dragstartHandler);
      clone.addEventListener("dragend", dragendHandler);
      container.appendChild(clone);
    }
  });
}

//---------------------------------------------------------
// Randomise layout
//---------------------------------------------------------

function randomiseShapes() {
  // grabbing the container and all shapes inside it
  const container = document.querySelector(".shape-container");
  const shapes = Array.from(document.querySelectorAll(".shape"));

  // getting container size so I can position things inside it
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // shuffling shapes so layout feels random each time
  shapes.sort(() => Math.random() - 0.5);

  // splitting the container into rough columns + rows so shapes don’t overlap too much
  const cols = 3;
  const rows = Math.ceil(shapes.length / cols);

  const zoneWidth = containerWidth / cols;
  const zoneHeight = containerHeight / rows;

  shapes.forEach((shape, i) => {
    // grabbing svg size so placement is more accurate
    const svg = shape.querySelector("svg");
    const shapeWidth = svg ? parseInt(svg.getAttribute("width")) : 100;
    const shapeHeight = svg ? parseInt(svg.getAttribute("height")) : 100;

    // figuring out which zone this shape belongs to
    const col = i % cols;
    const row = Math.floor(i / cols);

    const zoneX = col * zoneWidth;
    const zoneY = row * zoneHeight;

    // centering shape inside its zone
    const centerX = zoneX + (zoneWidth - shapeWidth) / 2;
    const centerY = zoneY + (zoneHeight - shapeHeight) / 2;

    // adding small randomness so it doesn’t look too grid-like
    const nudgeX = (Math.random() - 0.5) * 30;
    const nudgeY = (Math.random() - 0.5) * 30;

    // making sure shapes stay inside container bounds
    const x = Math.max(
      0,
      Math.min(centerX + nudgeX, containerWidth - shapeWidth),
    );
    const y = Math.max(
      0,
      Math.min(centerY + nudgeY, containerHeight - shapeHeight),
    );

    // applying position and random rotation for a more playful feel
    shape.style.position = "absolute";
    shape.style.left = `${x}px`;
    shape.style.top = `${y}px`;
    shape.style.transform = `rotate(${(Math.random() - 0.5) * 25}deg)`;

    // random z-index so shapes overlap naturally
    shape.style.zIndex = Math.floor(Math.random() * 5);
  });
}
//---------------------------------------------------------
// Drag
//---------------------------------------------------------
// Got this information from a W3 tutorial of how to make things draggable

// allowing to drag the shape
function dragstartHandler(e) {
  //tracking which shape the user is dragging
  activeShape = e.target;
  activeShape.classList.add("dragging");
  droppedOnGrid = false;

  // getting the data of the shape, this is to track which part of the shape is the user dragging
  // to ensure that the user can place the item based on the part of the shape that is grab on.

  // figuring out where the user grabbed the shape so it doesn’t jump when dropped
  const shapeWidth = Number(activeShape.dataset.width) || 1;

  // converting cursor position into grid units instead of pixels
  grabOffsetX = Math.floor(e.offsetX / (activeShape.offsetWidth / shapeWidth));

  // clamping the value so it stays within the shape bounds
  grabOffsetX = Math.max(0, Math.min(grabOffsetX, shapeWidth - 1));

  // doing the same for height so vertical placement feels correct
  const shapeHeight = Number(activeShape.dataset.height) || 1;

  // converting cursor position into grid units instead of pixels
  grabOffsetY = Math.floor(
    e.offsetY / (activeShape.offsetHeight / shapeHeight),
  );

  // clamping again to prevent overflow issues
  grabOffsetY = Math.max(0, Math.min(grabOffsetY, shapeHeight - 1));
}

// when the user stops dragging the item this is to reset everything for the next shape
function dragendHandler(e) {
  e.target.classList.remove("dragging");
  if (activeShape && !droppedOnGrid) {
    clearShapeOccupation(activeShape.dataset.shapeId);
  }
  droppedOnGrid = false;
  activeShape = null;
}

function dragoverHandler(e) {
  // needed to allow dropping onto the grid otherwise the browser blocks it
  e.preventDefault();
}

// handling what happens once the user drops a shape onto the grid
function dropHandler(e) {
  e.preventDefault();
  const square = e.currentTarget;
  if (!square || !activeShape) return;

  // getting the row and column of the square the user dropped onto
  const dropRow = Number(square.dataset.row);
  const dropCol = Number(square.dataset.col);

  // grabbing the shape size so I know how many cells it should take up
  const shapeWidth = Number(activeShape.dataset.width) || 1;
  const shapeHeight = Number(activeShape.dataset.height) || 1;

  // adjusting the start position based on where inside the shape the user grabbed it
  const startCol = dropCol - grabOffsetX;
  const startRow = dropRow - grabOffsetY;

  // storing all the cells the shape needs before placing it
  const cellsToFill = [];

  // checking every cell the shape would cover
  for (let r = 0; r < shapeHeight; r++) {
    for (let c = 0; c < shapeWidth; c++) {
      const targetCell = document.querySelector(
        `.square[data-row="${startRow + r}"][data-col="${startCol + c}"]`,
      );

      // stopping if part of the shape would go outside the grid
      if (!targetCell) return;

      // stopping if the new position overlaps another shape
      if (
        targetCell.dataset.occupied === "true" &&
        targetCell.dataset.shapeId !== activeShape.dataset.shapeId
      )
        return;

      cellsToFill.push(targetCell);
    }
  }

  // confirming the shape was successfully dropped on the grid
  droppedOnGrid = true;

  // clearing old occupied cells in case the shape is being moved
  clearShapeOccupation(activeShape.dataset.shapeId);

  // attaching the shape to the first valid cell
  const firstCell = cellsToFill[0];
  firstCell.appendChild(activeShape);

  // converting shape size into pixel size so it fits the grid properly
  const totalWidth = gridToPixels(shapeWidth);
  const totalHeight = gridToPixels(shapeHeight);

  // snapping the shape neatly into place visually
  activeShape.style.position = "absolute";
  activeShape.style.top = "0";
  activeShape.style.left = "0";
  activeShape.style.width = `${totalWidth}px`;
  activeShape.style.height = `${totalHeight}px`;
  activeShape.style.margin = "0";
  activeShape.style.zIndex = "2";
  activeShape.style.opacity = "0.95";
  activeShape.style.transform = "rotate(0deg)";

  // resizing the svg as well so the visual matches the new grid size
  const svg = activeShape.querySelector("svg");
  if (svg) {
    svg.setAttribute("width", totalWidth);
    svg.setAttribute("height", totalHeight);
  }

  // marking all covered cells as occupied so shapes can’t overlap wrongly
  cellsToFill.forEach((cell) => {
    cell.dataset.occupied = "true";
    cell.dataset.shapeId = activeShape.dataset.shapeId;
    cell.classList.add("occupied");
  });

  // only playing the preview sound when the loop is not already running this is for the sound system
  if (isPlaying) {
  } else {
    playColourSound(col[activeShape.dataset.colour], startRow);
  }
}

function clearShapeOccupation(shapeId) {
  // finding all grid cells that belong to this shape
  document
    .querySelectorAll(`.square[data-shape-id="${shapeId}"]`)
    .forEach((cell) => {
      // resetting the cell so it becomes available again
      cell.dataset.occupied = "false";
      cell.dataset.shapeId = "";
      cell.classList.remove("occupied");
    });
}

//---------------------------------------------------------
// Grid listeners
//---------------------------------------------------------

// listening for any movement for the shapes in the grid
document.querySelectorAll(".square").forEach((square) => {
  square.addEventListener("dragover", dragoverHandler);
  square.addEventListener("drop", dropHandler);
});

//---------------------------------------------------------
// Init
//---------------------------------------------------------

//to load the shapes when the window loads
window.addEventListener("load", () => {
  spawnShapes();
  randomiseShapes();
});

//---------------------------------------------------------
// Looper
//---------------------------------------------------------

let loopSequence = null;
let isPlaying = false;

function loopColour(col) {
  // highlighting the active column in the grid so users can see where the loop is
  document.querySelectorAll(".square").forEach((cell) => {
    cell.classList.toggle("col-active", parseInt(cell.dataset.col) === col);
  });
}

const loopBpm = document.getElementById("loop-bpm");
const bpmDisplay = document.getElementById("loop-bpm-val");

// set initial number
bpmDisplay.textContent = loopBpm.value;

// update when slider moves
loopBpm.addEventListener("input", () => {
  const bpm = loopBpm.value;
  bpmDisplay.textContent = bpm;
});

// starting the loop and resetting it each time so it plays cleanly
function startLoop() {
  // clearing any old scheduled sounds so the loop doesn’t stack
  Tone.Transport.cancel();

  // setting the tempo based on whatever the slider is currently at
  Tone.Transport.bpm.value = parseInt(loopBpm.value);

  let step = 0;

  loopSequence = new Tone.Sequence(
    (time) => {
      // using modulo so the loop cycles back through the 10 columns
      const col = step % 10;

      // checking each row in the current column for placed shapes
      for (let row = 0; row < 6; row++) {
        const cell = document.querySelector(
          `.square[data-row="${row}"][data-col="${col}"]`,
        );

        // only playing sound if that cell is occupied
        if (cell && cell.dataset.occupied === "true") {
          const shape = cell.querySelector(".shape");

          // getting the shape colour so I can match it to the right sound
          if (shape) {
            const colourName = colours[shape.dataset.colour];

            // playing the note based on both colour and row position
            if (colourName) playRowSound(colourName, row, time);
          }
        }
      }

      // syncing the visual loop feedback with the audio timing
      Tone.getDraw().schedule(() => {
        loopColour(col);
      }, time);

      // moving to the next step in the sequence
      step++;
    },

    // creating 10 steps to match the 10 columns in the grid
    Array.from({ length: 10 }, (_, i) => i),

    // each step plays on an eighth note
    "8n",
  );

  // starting the sequence from the beginning
  loopSequence.start(0);

  // starting the transport so the loop actually plays
  Tone.Transport.start();
}

// to stop the loop
function stopLoop() {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  if (loopSequence) {
    loopSequence.stop();
    loopSequence.dispose();
    loopSequence = null;
  }
  loopColour(-1);
}

// linking the button to do its functions
const playBtn = document.querySelector("#play-pause-btn");

function toggleLoop() {
  isPlaying = !isPlaying;

  if (isPlaying) {
    playBtn.src = "img/pause.svg";
    startLoop();
  } else {
    playBtn.src = "img/play.svg";
    stopLoop();
  }
}

playBtn.addEventListener("click", toggleLoop);
