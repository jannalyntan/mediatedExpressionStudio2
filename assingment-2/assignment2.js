// setting up the active shape
let activeShape = null;

//resetting everything
let grabOffsetX = 0;
let grabOffsetY = 0;

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

  // runs to see whether the square is being taken and also if it can fit into the grid.

  //runs the loop depending on how big the height and width is
  for (let r = 0; r < shapeHeight; r++) {
    for (let c = 0; c < shapeWidth; c++) {
      const targetRow = startRow + r;
      const targetCol = startCol + c;

      const targetCell = document.querySelector(
        `.square[data-row="${targetRow}"][data-col="${targetCol}"]`,
      );

      // outside the grid container, put back the shape
      if (!targetCell) return;

      // occupied by another shape, put back the shape
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
