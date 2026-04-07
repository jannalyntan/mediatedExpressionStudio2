// setting up the active shape
let activeShape = null;

// so that it knows which cell inside the shape was grabbed
let grabOffsetX = 0;
let grabOffsetY = 0;

// maps the CSS variable string back to a colour name
const cssToColourName = {
  "var(--blue)": "blue",
  "var(--pink)": "pink",
  "var(--green)": "green",
  "var(--yellow)": "yellow",
};

//---------------------------------------------------------
// Sound System
//---------------------------------------------------------

//---------------------------------------------------------
// AUDIO SETUP (CHILD-LIKE INSTRUMENTS)
//---------------------------------------------------------

// Start audio on first click (REQUIRED)
document.addEventListener(
  "click",
  async () => {
    await Tone.start();
    console.log("Audio ready");
  },
  { once: true },
);

//---------------------------------------------------------
// Effects
//---------------------------------------------------------

const reverb = new Tone.Reverb({
  decay: 1.5,
  wet: 0.15,
}).toDestination();

//---------------------------------------------------------
// 🔵 BLUE → Drum Kit
//---------------------------------------------------------

const drumSynth = new Tone.MembraneSynth({
  pitchDecay: 0.02,
  octaves: 2,
  oscillator: { type: "sine" },
  envelope: {
    attack: 0.01,
    decay: 0.15,
    sustain: 0,
    release: 0.2,
  },
  volume: -8, // softer!!
}).connect(reverb);

//---------------------------------------------------------
// 🌸 PINK → Kid Piano
//---------------------------------------------------------

const pinkSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" }, // soft + warm
  envelope: {
    attack: 0.02,
    decay: 0.3,
    sustain: 0.3,
    release: 0.6, // longer tail
  },
  volume: -6,
}).connect(reverb);

//---------------------------------------------------------
// 🟢 GREEN → Triangle
//---------------------------------------------------------

const greenSynth = new Tone.MetalSynth({
  frequency: 600,
  envelope: {
    attack: 0.001,
    decay: 0.4,
    release: 0.2,
  },
  harmonicity: 5,
  modulationIndex: 32,
  resonance: 3000,
}).connect(reverb);

//---------------------------------------------------------
// 🟡 YELLOW → Xylophone / Toy
//---------------------------------------------------------

const yellowSynth = new Tone.FMSynth({
  harmonicity: 4,
  modulationIndex: 12,
  envelope: {
    attack: 0.001,
    decay: 0.08,
    sustain: 0,
    release: 0.1,
  },
  modulation: {
    type: "square",
  },
  modulationEnvelope: {
    attack: 0.001,
    decay: 0.05,
    sustain: 0,
    release: 0.05,
  },
  volume: -2,
}).connect(reverb);

//---------------------------------------------------------
// Patterns (chime / rhythm per colour)
//---------------------------------------------------------

const colourPatterns = {
  blue: ["kick", "snare", "kick"], // drum rhythm
  pink: ["C6", "E6", "G6"], // piano chime
  green: ["C6"], // triangle hit
  yellow: ["G5", "B5", "D6"], // xylophone run
};

//---------------------------------------------------------
// PLAY SOUND
//---------------------------------------------------------

function playColourSound(colourName) {
  const now = Tone.now();

  // 🔵 DRUM KIT
  if (colourName === "blue") {
    drumSynth.triggerAttackRelease("C3", "16n", now);
    drumSynth.triggerAttackRelease("G3", "16n", now + 0.12);
    drumSynth.triggerAttackRelease("E3", "16n", now + 0.24);
    return;
  }

  const pattern = colourPatterns[colourName];

  pattern.forEach((note, i) => {
    const time = now + i * 0.12;

    if (colourName === "pink") {
      pinkSynth.triggerAttackRelease(note, "8n", time);
    }

    if (colourName === "yellow") {
      yellowSynth.triggerAttackRelease(note, "16n", time);
    }

    if (colourName === "green") {
      greenSynth.triggerAttackRelease("C6", "8n", time);
    }
  });
}

//---------------------------------------------------------
// Spawn Shapes into the shape container
//---------------------------------------------------------

function spawnShapes() {
  const container = document.querySelector(".shape-container");

  const rectangle = document.querySelector("#rectangle");
  const triangle = document.querySelector("#triangle");
  const circle = document.querySelector("#circle");
  const bridge = document.querySelector("#bridge");

  // FIX: put them all in one array, filter out nulls in case one doesnt exist in HTML
  const originals = [rectangle, triangle, circle, bridge].filter(Boolean);

  const colours = [
    "var(--blue)",
    "var(--pink)",
    "var(--green)",
    "var(--yellow)",
  ];

  originals.forEach((shape) => {
    // FIX: bridge gets 2 copies, everything else gets 5
    const copies = shape === bridge ? 2 : 6;

    for (let i = 0; i < copies; i++) {
      const clone = shape.cloneNode(true);

      clone.removeAttribute("id");

      // assign random colour
      const randomColour = colours[Math.floor(Math.random() * colours.length)];
      clone.style.setProperty("--shape-color", randomColour);

      // store colour as data attribute so dropHandler can read it later
      clone.dataset.colour = randomColour;

      // FIX: attach drag events to every clone so they are draggable
      clone.addEventListener("dragstart", dragstartHandler);
      clone.addEventListener("dragend", dragendHandler);

      container.appendChild(clone);
    }
  });
}

//---------------------------------------------------------
// Randomise Shapes inside the shape container
//---------------------------------------------------------
function randomiseShapes() {
  const container = document.querySelector(".shape-container");
  const shapes = Array.from(document.querySelectorAll(".shape"));

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  shapes.sort(() => Math.random() - 0.5);

  const cols = 3;
  const rows = Math.ceil(shapes.length / cols);
  const zoneWidth = containerWidth / cols;
  const zoneHeight = containerHeight / rows;

  shapes.forEach((shape, i) => {
    const svg = shape.querySelector("svg");
    const shapeWidth = svg ? parseInt(svg.getAttribute("width")) : 100;
    const shapeHeight = svg ? parseInt(svg.getAttribute("height")) : 100;

    // place in a grid zone
    const col = i % cols;
    const row = Math.floor(i / cols);

    const zoneX = col * zoneWidth;
    const zoneY = row * zoneHeight;

    // center the shape inside its zone
    const centerX = zoneX + (zoneWidth - shapeWidth) / 2;
    const centerY = zoneY + (zoneHeight - shapeHeight) / 2;

    // small nudge so it doesnt look too perfect
    const nudgeX = (Math.random() - 0.5) * 30;
    const nudgeY = (Math.random() - 0.5) * 30;

    const x = Math.max(
      0,
      Math.min(centerX + nudgeX, containerWidth - shapeWidth),
    );
    const y = Math.max(
      0,
      Math.min(centerY + nudgeY, containerHeight - shapeHeight),
    );

    // slight rotation — like someone laid them down casually
    const rotation = (Math.random() - 0.5) * 25;
    const zIndex = Math.floor(Math.random() * 5);

    shape.style.position = "absolute";
    shape.style.left = `${x}px`;
    shape.style.top = `${y}px`;
    shape.style.transform = `rotate(${rotation}deg)`;
    shape.style.zIndex = zIndex;
  });
}

//---------------------------------------------------------
// Drag Functions
//---------------------------------------------------------

function dragstartHandler(e) {
  activeShape = e.target;
  activeShape.classList.add("dragging");

  // width offset — which column of the shape was grabbed
  const shapeWidth = Number(activeShape.dataset.width) || 1;
  const shapePixelWidth = activeShape.offsetWidth;
  const sectionWidth = shapePixelWidth / shapeWidth;
  const x = e.offsetX;
  grabOffsetX = Math.floor(x / sectionWidth);

  if (grabOffsetX < 0) grabOffsetX = 0;
  if (grabOffsetX >= shapeWidth) grabOffsetX = shapeWidth - 1;

  // height offset — which row of the shape was grabbed
  const shapeHeight = Number(activeShape.dataset.height) || 1;
  const shapePixelHeight = activeShape.offsetHeight;
  const sectionHeight = shapePixelHeight / shapeHeight;
  const y = e.offsetY;
  grabOffsetY = Math.floor(y / sectionHeight);

  if (grabOffsetY < 0) grabOffsetY = 0;
  if (grabOffsetY >= shapeHeight) grabOffsetY = shapeHeight - 1;
}

// FIX: removed activeShape.reset() which doesnt exist
function dragendHandler(e) {
  e.target.classList.remove("dragging");
  activeShape = null;
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

function dropHandler(ev) {
  ev.preventDefault();

  const square = ev.currentTarget;
  if (!square || !activeShape) return;

  const dropRow = Number(square.dataset.row);
  const dropCol = Number(square.dataset.col);

  const shapeWidth = Number(activeShape.dataset.width) || 1;
  const shapeHeight = Number(activeShape.dataset.height) || 1;

  // adjust start position based on which part of the shape was grabbed
  const startCol = dropCol - grabOffsetX;
  const startRow = dropRow - grabOffsetY;

  const cellsToFill = [];

  // loop through every row and column the shape needs to occupy
  for (let r = 0; r < shapeHeight; r++) {
    for (let c = 0; c < shapeWidth; c++) {
      const targetRow = startRow + r;
      const targetCol = startCol + c;

      const targetCell = document.querySelector(
        `.square[data-row="${targetRow}"][data-col="${targetCol}"]`,
      );

      // outside the grid — cancel drop
      if (!targetCell) return;

      // occupied by a different shape — cancel drop
      if (
        targetCell.dataset.occupied === "true" &&
        targetCell.dataset.shapeId !== activeShape.id
      ) {
        return;
      }

      cellsToFill.push(targetCell);
    }
  }

  clearShapeOccupation(activeShape.id);

  // place the shape into the first cell
  const firstCell = cellsToFill[0];
  firstCell.appendChild(activeShape);

  // calculate exact pixel size to cover all occupied cells including gaps
  const cellSize = 100;
  const gap = 10;
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
  activeShape.style.transform = "rotate(0deg)";

  // mark all cells as occupied
  cellsToFill.forEach((cell) => {
    cell.dataset.occupied = "true";
    cell.dataset.shapeId = activeShape.id;
    cell.classList.add("occupied");
  });

  // play the sound for this shape's colour
  const cssColour = activeShape.dataset.colour;
  const colourName = cssToColourName[cssColour];
  playColourSound(colourName);
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
// Grid Drop Listeners
//---------------------------------------------------------

document.querySelectorAll(".square").forEach((square) => {
  square.addEventListener("dragover", dragoverHandler);
  square.addEventListener("drop", dropHandler);
});

//---------------------------------------------------------
// Init
//---------------------------------------------------------

window.addEventListener("load", () => {
  spawnShapes();
  randomiseShapes();
});
