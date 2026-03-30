// setting up the active shape
let activeShape = null;

// so that it knows which cell inside the shape was grabbed
let grabOffset = 0;

//---------------------------------------------------------
// Moving the shape
//---------------------------------------------------------
//When the user starts to drag the shape, it will run the function
document.querySelectorAll(".shape").forEach((shape) => {
  shape.addEventListener("dragstart", dragstartHandler);
  shape.addEventListener("dragend", dragendHandler);
});

//---------------------------------------------------------
// Dragging functions
//---------------------------------------------------------
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

  // where inside the shape the user grabbed
  const x = e.offsetX;
  grabOffset = Math.floor(x / sectionWidth);

  // just in case, ensuring it won't work if the user clicks out of it
  if (grabOffset < 0) grabOffset = 0;
  if (grabOffset >= shapeWidth) grabOffset = shapeWidth - 1;
}

// End of drag event
function dragendHandler(ev) {
  ev.target.classList.remove("dragging");
  activeShape = null;
}

// Based on the API guide
function dragoverHandler(ev) {
  ev.preventDefault();
}

function dropHandler(ev) {
  ev.preventDefault();

  //mkaing the dragged shape the
  const square = ev.currentTarget;
  if (!square || !activeShape) return;

  //tracking which square did the user drop the block on
  const dropRow = Number(square.dataset.row);
  const dropCol = Number(square.dataset.col);

  //Tracking the number of squares the block needs
  const shapeWidth = Number(activeShape.dataset.width) || 1;
  const shapeHeight = Number(activeShape.dataset.height) || 1;

  if (shapeHeight !== 1) return;

  // adjust start column based on which side was grabbed
  const startCol = dropCol - grabOffset;
  const startRow = dropRow - grabOffset;

  for (let c = 0; c < shapeWidth; c++) {
    const targetCol = startCol + c;

    const targetCell = document.querySelector(
      `.square[data-row="${startRow}"][data-col="${targetCol}"]`,
    );

    // outside grid
    if (!targetCell) return;

    // occupied by another shape
    if (
      targetCell.dataset.occupied === "true" &&
      targetCell.dataset.shapeId !== activeShape.id
    ) {
      return;
    }

    cellsToFill.push(targetCell);
  }

  clearShapeOccupation(activeShape.id);

  // place the shape into the first cell
  const firstCell = cellsToFill[0];
  firstCell.appendChild(activeShape);

  activeShape.style.position = "absolute";
  activeShape.style.top = "0";
  activeShape.style.left = "0";
  activeShape.style.margin = "0";
  activeShape.style.zIndex = "10";

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

document.querySelectorAll(".square").forEach((square) => {
  square.addEventListener("dragover", dragoverHandler);
  square.addEventListener("drop", dropHandler);
});
