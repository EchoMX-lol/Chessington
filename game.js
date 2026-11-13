
const boardElement = document.getElementById("game-board");
const statusElement = document.getElementById("game-status");
const descriptionElement = document.getElementById("status-description");
const historyElement = document.getElementById("move-history");
const moveCountElement = document.getElementById("move-count");
const promotionChoice = document.getElementById("promotion-choice");

const whiteTurnIndicator = document.getElementById("white-turn");
const blackTurnIndicator = document.getElementById("black-turn");

const newGameButton = document.getElementById("new-game");
const undoButton = document.getElementById("undo-move");

const chess = new Chess();

let selectedSquare = null;
let legalMoves = [];
let lastMove = null;

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
  boardElement.replaceChildren();

  const position = chess.board();

  position.forEach((row, rowIndex) => {
    row.forEach((piece, columnIndex) => {
      const squareName =
        "abcdefgh"[columnIndex] + (8 - rowIndex);

      const square = document.createElement("button");
      square.type = "button";
      square.className = "square";

      const isLight = (rowIndex + columnIndex) % 2 === 0;

      square.classList.add(isLight ? "light" : "dark");

      if (squareName === selectedSquare) {
        square.classList.add("selected");
      }

      if (legalMoves.some(move => move.to === squareName)) {
        square.classList.add("legal-move");

        if (piece) {
          square.classList.add("has-piece");
        }
      }

      if (
        lastMove &&
        (squareName === lastMove.from || squareName === lastMove.to)
      ) {
        square.classList.add("last-move");
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

      square.addEventListener("click", () => {
        handleSquareClick(squareName);
      });

      boardElement.appendChild(square);
    });
  });
}

function handleSquareClick(squareName) {
  if (chess.game_over()) {
    return;
  }

  const piece = chess.get(squareName);

  if (selectedSquare) {
    const chosenMove = legalMoves.find(
      move => move.to === squareName
    );

    if (chosenMove) {
      const movingPiece = chess.get(selectedSquare);

      const promotion =
        movingPiece.type === "p" &&
        (squareName.endsWith("8") || squareName.endsWith("1"));

      const move = chess.move({
        from: selectedSquare,
        to: squareName,
        promotion: promotion ? promotionChoice.value : "q"
      });

      if (move) {
        lastMove = {
          from: move.from,
          to: move.to
        };

        selectedSquare = null;
        legalMoves = [];

        updateGame();
        return;
      }
    }
  }

  if (piece && piece.color === chess.turn()) {
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
}

function updateStatus() {
  const currentTurn = chess.turn() === "w" ? "White" : "Black";

  whiteTurnIndicator.classList.toggle(
    "active",
    chess.turn() === "w" && !chess.game_over()
  );

  blackTurnIndicator.classList.toggle(
    "active",
    chess.turn() === "b" && !chess.game_over()
  );

  if (chess.in_checkmate()) {
    const winner = chess.turn() === "w" ? "Black" : "White";

    statusElement.textContent = "Checkmate!";
    descriptionElement.textContent = `${winner} wins the game.`;
  } else if (chess.in_draw()) {
    statusElement.textContent = "Draw!";
    descriptionElement.textContent = "The game has ended in a draw.";
  } else if (chess.in_stalemate()) {
    statusElement.textContent = "Stalemate!";
    descriptionElement.textContent = "Neither player can make a legal move.";
  } else if (chess.in_check()) {
    statusElement.textContent = `${currentTurn} is in check!`;
    descriptionElement.textContent = "Make a move to protect your king.";
  } else {
    statusElement.textContent = `${currentTurn} to move`;
    descriptionElement.textContent = "Select a piece to make your move.";
  }
}

function updateHistory() {
  const history = chess.history();

  historyElement.replaceChildren();

  if (history.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-history";
    emptyMessage.textContent = "Your moves will appear here.";
    historyElement.appendChild(emptyMessage);
  }

  for (let i = 0; i < history.length; i += 2) {
    const row = document.createElement("div");
    row.className = "move-row";

    const number = document.createElement("span");
    number.className = "move-number";
    number.textContent = `${Math.floor(i / 2) + 1}.`;

    const whiteMove = document.createElement("span");
    whiteMove.className = "move-white";
    whiteMove.textContent = history[i];

    const blackMove = document.createElement("span");
    blackMove.className = "move-black";
    blackMove.textContent = history[i + 1] || "—";

    row.append(number, whiteMove, blackMove);
    historyElement.appendChild(row);
  }

  historyElement.scrollTop = historyElement.scrollHeight;

  const totalMoves = Math.ceil(history.length / 2);
  moveCountElement.textContent =
    `${totalMoves} ${totalMoves === 1 ? "move" : "moves"}`;
}

function updateGame() {
  renderBoard();
  updateStatus();
  updateHistory();
}

function startNewGame() {
  chess.reset();

  selectedSquare = null;
  legalMoves = [];
  lastMove = null;

  updateGame();
}

function undoMove() {
  const undoneMove = chess.undo();

  if (!undoneMove) {
    return;
  }

  selectedSquare = null;
  legalMoves = [];

  const history = chess.history({ verbose: true });
  const previousMove = history[history.length - 1];

  lastMove = previousMove
    ? {
        from: previousMove.from,
        to: previousMove.to
      }
    : null;

  updateGame();
}


newGameButton.addEventListener("click", startNewGame);
undoButton.addEventListener("click", undoMove);

// ===== GAME MODE NAVIGATION =====

const modeButtons = document.querySelectorAll(".mode-button");
const gameLayout = document.querySelector(".game-layout");
const modePlaceholder = document.getElementById("mode-placeholder");

const placeholderEyebrow = document.getElementById("placeholder-eyebrow");
const placeholderTitle = document.getElementById("placeholder-title");
const placeholderDescription = document.getElementById("placeholder-description");

function switchMode(mode) {
  modeButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  if (mode === "computer") {
    gameLayout.hidden = false;
    modePlaceholder.hidden = true;
    return;
  }

  gameLayout.hidden = true;
  modePlaceholder.hidden = false;

  if (mode === "online") {
    placeholderEyebrow.textContent = "PLAY WITH OTHERS";
    placeholderTitle.textContent = "Online play is coming.";
    placeholderDescription.textContent =
      "We're preparing online matches, private rooms, and the ability to challenge your friends.";
  }

  if (mode === "practice") {
    placeholderEyebrow.textContent = "IMPROVE YOUR GAME";
    placeholderTitle.textContent = "Practice mode.";
    placeholderDescription.textContent =
      "A dedicated space for experimenting with positions, learning openings, and improving your chess skills is coming soon.";
  }
}

modeButtons.forEach(button => {
  button.addEventListener("click", () => {
    switchMode(button.dataset.mode);
  });
});

updateGame();
