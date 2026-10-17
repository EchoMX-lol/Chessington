
const previewBoard = document.getElementById("preview-board");
const playButton = document.getElementById("play-button");

const startingPosition = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];

function createPreviewBoard() {
  if (!previewBoard) return;

  previewBoard.replaceChildren();

  startingPosition.forEach((row, rowIndex) => {
    row.forEach((piece, columnIndex) => {
      const square = document.createElement("div");
      const isLight = (rowIndex + columnIndex) % 2 === 0;

      square.className = `square ${isLight ? "light" : "dark"}`;

      if (piece) {
        const pieceElement = document.createElement("span");
        pieceElement.textContent = piece;
        pieceElement.className = rowIndex < 2
          ? "piece-black"
          : "piece-white";

        square.appendChild(pieceElement);
      }

      previewBoard.appendChild(square);
    });
  });
}

createPreviewBoard();

playButton?.addEventListener("click", () => {
  alert("Chessington is warming up! The playable chess game is coming next.");
});
