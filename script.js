
const previewBoard = document.getElementById("preview-board");
const playButton = document.getElementById("play-button");

const chess = new Chess();

let selectedSquare = null;
let legalMoves = [];

const pieces = {
  w: {
    k: "♔",
    q: "♕",
    r: "♖",
    b: "♗",
    n: "♘",
    p: "♙"
  },
  b: {
    k: "♚",
    q: "♛",
    r: "♜",
    b: "♝",
    n: "♞",
    p: "♟"
  }
};

function renderBoard() {
  if (!previewBoard) return;

  previewBoard.replaceChildren();

  const position = chess.board();

  position.forEach((row, rowIndex) => {
    row.forEach((piece, columnIndex) => {
      const squareName =
        "abcdefgh"[columnIndex] + (8 - rowIndex);

      const square = document.createElement("button");
      square.type = "button";

      const isLight = (rowIndex + columnIndex) % 2 === 0;
      square.className = `square ${isLight ? "light" : "dark"}`;

      if (squareName === selectedSquare) {
        square.classList.add("selected");
      }

      if (legalMoves.some(move => move.to === squareName)) {
        square.classList.add("legal-move");
      }

      if (piece) {
        const pieceElement = document.createElement("span");
        pieceElement.textContent = pieces[piece.color][piece.type];
        pieceElement.className =
          piece.color === "w" ? "piece-white" : "piece-black";

        square.appendChild(pieceElement);
      }

      square.setAttribute(
        "aria-label",
        `${squareName}${piece ? `, ${piece.color === "w" ? "white" : "black"} ${piece.type}` : ""}`
      );

      square.addEventListener("click", () => handleSquareClick(squareName));

      previewBoard.appendChild(square);
    });
  });
}

function handleSquareClick(squareName) {
  const piece = chess.get(squareName);

  if (selectedSquare) {
    const move = legalMoves.find(item => item.to === squareName);

    if (move) {
      try {
        chess.move({
          from: selectedSquare,
          to: squareName,
          promotion: "q"
        });

        selectedSquare = null;
        legalMoves = [];
        renderBoard();
        showGameStatus();
        return;
      } catch (error) {
        console.error("Move could not be made:", error);
      }
    }
  }

  if (piece) {
    selectedSquare = squareName;
    legalMoves = chess.moves({
      square: squareName,
      verbose: true
    });
  } else {
    selectedSquare = null;
    legalMoves = [];
  }

  renderBoard();
  showGameStatus();
}

function showGameStatus() {
  let status = document.getElementById("game-status");

  if (!status) {
    status = document.createElement("p");
    status.id = "game-status";
    status.className = "board-caption";

    if (previewBoard?.parentElement) {
      previewBoard.parentElement.insertAdjacentElement("afterend", status);
    }
  }

  if (chess.isCheckmate()) {
    status.textContent = `Checkmate! ${chess.turn() === "w" ? "Black" : "White"} wins!`;
  } else if (chess.isDraw()) {
    status.textContent = "Game drawn!";
  } else if (chess.isCheck()) {
    status.textContent = `${chess.turn() === "w" ? "White" : "Black"} to move — Check!`;
  } else {
    status.textContent = `${chess.turn() === "w" ? "White" : "Black"} to move`;
  }
}

playButton?.addEventListener("click", () => {
  document.querySelector(".chess-preview")?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
  showGameStatus();
});

renderBoard();
showGameStatus();
