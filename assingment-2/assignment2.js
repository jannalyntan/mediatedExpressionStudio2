let activeShape = null;
let droppedOnGrid = false;
let grabOffsetX = 0;
let grabOffsetY = 0;

const CELL_SIZE = 100;
const GAP = 10;

const cssToColourName = {
  "var(--blue)": "blue",
  "var(--pink)": "pink",
  "var(--green)": "green",
  "var(--yellow)": "yellow",
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

const drumSynth = new Tone.MembraneSynth({
  pitchDecay: 0.02,
  octaves: 2,
  oscillator: { type: "sine" },
  envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.2 },
  volume: -8,
}).connect(reverb);

const pinkSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.02, decay: 0.3, sustain: 0.3, release: 0.6 },
  volume: -6,
}).connect(reverb);

const greenSynth = new Tone.MetalSynth({
  frequency: 600,
  envelope: { attack: 0.001, decay: 0.4, release: 0.2 },
  harmonicity: 5,
  modulationIndex: 32,
  resonance: 3000,
}).connect(reverb);

const yellowSynth = new Tone.FMSynth({
  harmonicity: 4,
  modulationIndex: 12,
  envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.1 },
  modulation: { type: "square" },
  modulationEnvelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
  volume: -2,
}).connect(reverb);

const colourPatterns = {
  blue: ["kick", "snare", "kick"],
  pink: ["C6", "E6", "G6"],
  green: ["C6"],
  yellow: ["G5", "B5", "D6"],
};

function playColourSound(colourName) {
  const now = Tone.now();
  if (colourName === "blue") {
    drumSynth.triggerAttackRelease("C3", "16n", now);
    drumSynth.triggerAttackRelease("G3", "16n", now + 0.12);
    drumSynth.triggerAttackRelease("E3", "16n", now + 0.24);
    return;
  }
  const pattern = colourPatterns[colourName];
  if (!pattern) return;
  pattern.forEach((note, i) => {
    const time = now + i * 0.12;
    if (colourName === "pink") pinkSynth.triggerAttackRelease(note, "8n", time);
    if (colourName === "yellow")
      yellowSynth.triggerAttackRelease(note, "16n", time);
    if (colourName === "green")
      greenSynth.triggerAttackRelease("C6", "8n", time);
  });
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

function spawnShapes() {
  const container = document.querySelector(".shape-container");
  const bridge = document.querySelector("#bridge");
  const originals = [
    document.querySelector("#rectangle"),
    document.querySelector("#triangle"),
    document.querySelector("#circle"),
    bridge,
  ].filter(Boolean);

  const colours = [
    "var(--blue)",
    "var(--pink)",
    "var(--green)",
    "var(--yellow)",
  ];

  originals.forEach((shape) => {
    const copies = shape === bridge ? 2 : 6;
    for (let i = 0; i < copies; i++) {
      const clone = shape.cloneNode(true);
      clone.removeAttribute("id");
      clone.dataset.shapeId = `shape-${Date.now()}-${Math.random()}`;

      const randomColour = colours[Math.floor(Math.random() * colours.length)];
      clone.style.setProperty("--shape-color", randomColour);
      clone.dataset.colour = randomColour;

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

    const col = i % cols;
    const row = Math.floor(i / cols);
    const zoneX = col * zoneWidth;
    const zoneY = row * zoneHeight;

    const centerX = zoneX + (zoneWidth - shapeWidth) / 2;
    const centerY = zoneY + (zoneHeight - shapeHeight) / 2;
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

    shape.style.position = "absolute";
    shape.style.left = `${x}px`;
    shape.style.top = `${y}px`;
    shape.style.transform = `rotate(${(Math.random() - 0.5) * 25}deg)`;
    shape.style.zIndex = Math.floor(Math.random() * 5);
  });
}

//---------------------------------------------------------
// Drag
//---------------------------------------------------------

function dragstartHandler(e) {
  activeShape = e.target;
  activeShape.classList.add("dragging");
  droppedOnGrid = false;

  const shapeWidth = Number(activeShape.dataset.width) || 1;
  grabOffsetX = Math.floor(e.offsetX / (activeShape.offsetWidth / shapeWidth));
  grabOffsetX = Math.max(0, Math.min(grabOffsetX, shapeWidth - 1));

  const shapeHeight = Number(activeShape.dataset.height) || 1;
  grabOffsetY = Math.floor(
    e.offsetY / (activeShape.offsetHeight / shapeHeight),
  );
  grabOffsetY = Math.max(0, Math.min(grabOffsetY, shapeHeight - 1));
}

function dragendHandler(e) {
  e.target.classList.remove("dragging");
  if (activeShape && !droppedOnGrid) {
    clearShapeOccupation(activeShape.dataset.shapeId);
  }
  droppedOnGrid = false;
  activeShape = null;
}

function dragoverHandler(e) {
  e.preventDefault();
}

function dropHandler(e) {
  e.preventDefault();
  const square = e.currentTarget;
  if (!square || !activeShape) return;

  const dropRow = Number(square.dataset.row);
  const dropCol = Number(square.dataset.col);
  const shapeWidth = Number(activeShape.dataset.width) || 1;
  const shapeHeight = Number(activeShape.dataset.height) || 1;
  const startCol = dropCol - grabOffsetX;
  const startRow = dropRow - grabOffsetY;

  const cellsToFill = [];

  for (let r = 0; r < shapeHeight; r++) {
    for (let c = 0; c < shapeWidth; c++) {
      const targetCell = document.querySelector(
        `.square[data-row="${startRow + r}"][data-col="${startCol + c}"]`,
      );
      if (!targetCell) return;
      if (
        targetCell.dataset.occupied === "true" &&
        targetCell.dataset.shapeId !== activeShape.dataset.shapeId
      )
        return;
      cellsToFill.push(targetCell);
    }
  }

  droppedOnGrid = true;
  clearShapeOccupation(activeShape.dataset.shapeId);

  const firstCell = cellsToFill[0];
  firstCell.appendChild(activeShape);

  const totalWidth = gridToPixels(shapeWidth);
  const totalHeight = gridToPixels(shapeHeight);

  activeShape.style.position = "absolute";
  activeShape.style.top = "0";
  activeShape.style.left = "0";
  activeShape.style.width = `${totalWidth}px`;
  activeShape.style.height = `${totalHeight}px`;
  activeShape.style.margin = "0";
  activeShape.style.zIndex = "2";
  activeShape.style.opacity = "0.95";
  activeShape.style.transform = "rotate(0deg)";

  const svg = activeShape.querySelector("svg");
  if (svg) {
    svg.setAttribute("width", totalWidth);
    svg.setAttribute("height", totalHeight);
  }

  cellsToFill.forEach((cell) => {
    cell.dataset.occupied = "true";
    cell.dataset.shapeId = activeShape.dataset.shapeId;
    cell.classList.add("occupied");
  });

  playColourSound(cssToColourName[activeShape.dataset.colour]);
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
// Grid listeners
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
