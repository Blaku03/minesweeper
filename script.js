"use strict";

// TODO
// (more time)
// for each number own style
// add icons to mine and flag
// selectable difficulties

// Variables
const minesLeftText = document.querySelector(".subtext");
const board = document.querySelector(".board");
const minesweeperTitle = document.querySelector("h1");
const squareValue = [];
let positionOfMines = new Set();
const gameDifficulty = "beginner";
const sizeOfBoardForDifficulty = {
	beginner: 8,
	intermediate: 10,
	advanced: 12,
};
let endOfGame = false;
const boardSize = sizeOfBoardForDifficulty[gameDifficulty];
const actualBoardSize = boardSize + 2;
let minesLeft = 10;
let nonMineTilesLeft = boardSize * boardSize - minesLeft;

// Random number in range
const randomNum = (rangeMin, rangeMax) =>
	Math.trunc(Math.random() * (rangeMax - rangeMin + 1)) + rangeMin;

const createSquareValue = function () {
	// Fill the array
	for (let i = 0; i < actualBoardSize * actualBoardSize; i++) {
		squareValue.push("");
	}

	// Add boundaries to the first row
	for (let i = 0; i < actualBoardSize; i++) {
		squareValue[i] = "boundary";
	}

	// Add boundaries to the last row
	for (
		let i = actualBoardSize * actualBoardSize - actualBoardSize;
		i < actualBoardSize * actualBoardSize;
		i++
	) {
		squareValue[i] = "boundary";
	}

	// Add boundaries to the sides
	for (
		let i = actualBoardSize;
		i < actualBoardSize * actualBoardSize;
		i += actualBoardSize
	) {
		squareValue[i] = squareValue[i + actualBoardSize - 1] = "boundary";
	}

	// Fill the rest of board with 0
	for (let i = 0; i < actualBoardSize * actualBoardSize; i++) {
		if (squareValue[i] !== "boundary") squareValue[i] = 0;
	}
};

const createRandomMines = function () {
	// All mines should have unique position that's the reason for using set
	while (positionOfMines.size < 10) {
		const randomMine = randomNum(11, 88);
		if (squareValue[randomMine] !== "boundary")
			positionOfMines.add(randomMine);
	}
	positionOfMines = [...positionOfMines];
};

// Main array with values of tiles
createSquareValue();

// Create mines in random tiles
createRandomMines();

// Place mines in proper tiles and calculate values of adjacent squares
positionOfMines.forEach((mine) => {
	// Position of the top left square
	let temp = mine - (actualBoardSize + 1);
	squareValue[mine] = "mine";

	for (let i = 0; i < 3; i++) {
		// Only increase the number tiles
		if (typeof squareValue[temp] === "number") squareValue[temp]++;
		if (typeof squareValue[temp + 1] === "number") squareValue[temp + 1]++;
		if (typeof squareValue[temp + 2] === "number") squareValue[temp + 2]++;

		// Go to the next row
		temp += actualBoardSize;
	}
});

// Create board in DOM
for (let i = 0; i < 100; i++) {
	if (squareValue[i] !== "boundary") {
		let html;
		if (squareValue[i] === "mine") {
			html = `<div data-status="hidden" id="mine"></div>`;
		} else {
			html = `<div data-status="hidden" data-value="${squareValue[i]}" id="${i}"></div>`;
		}
		board.insertAdjacentHTML("beforeend", html);
	}
}

const showTile = function (tile) {
	// Basic returns
	if (tile?.dataset.status === "flag") return;
	if (squareValue[Number(tile?.id)] === "boundary") return;
	if (squareValue[Number(tile?.id)] === "mine") return;

	if (Number(tile?.dataset.value) > 0) {
		tile.innerHTML = tile.dataset.value;
	}

	// Have to watch out for tile that doesn't exist
	if (tile?.dataset) {
		// Only for optimization when user would click the already visible tile
		tile.dataset.value = "visible-content";

		tile.dataset.status = "number";
	}
};

// First method that tried to spread show tiles
// const spreadColumn = function (tile) {
//   let currentTile = tile;

//   // Spread down
//   while (Number(currentTile?.dataset.value) === 0) {
//     showTile(currentTile);
//     currentTile = document.getElementById(
//       `${Number(currentTile.id) + actualBoardSize}`
//     );
//   }

//   // Show one number tile
//   if (Number(currentTile?.dataset.value) > 0) showTile(currentTile);

//   // Spread up
//   currentTile = document.getElementById(`${Number(tile.id) - actualBoardSize}`);

//   while (Number(currentTile?.dataset.value) === 0) {
//     showTile(currentTile);
//     currentTile = document.getElementById(
//       `${Number(currentTile.id) - actualBoardSize}`
//     );
//   }

//   if (Number(currentTile?.dataset.value) > 0) showTile(currentTile);
// };

// const spreadRow = function (row) {
//   let oneNumberTile = false;
//   let currentRow = row;

//   while (Number(currentRow?.dataset.value) === 0) {
//     spreadColumn(currentRow);
//     currentRow = document.getElementById(`${Number(currentRow.id) + 1}`);
//   }

//   if (Number(currentRow?.dataset.value) > 0) {
//     showTile(currentRow);
//     oneNumberTile = true;
//   }

//   currentRow = document.getElementById(`${Number(row.id) - 1}`);

//   while (Number(currentRow?.dataset.value) === 0) {
//     spreadColumn(currentRow);
//     currentRow = document.getElementById(`${Number(currentRow.id) - 1}`);
//   }

//   if (Number(currentRow?.dataset.value) > 0 && !oneNumberTile)
//     showTile(currentRow);
// };

const showAroundTile = function (tile) {
	// Position of the top left square
	let temp = Number(tile?.id) - (actualBoardSize + 1);

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const currentTile = document.getElementById(`${temp + j}`);
			if (
				Number(currentTile?.dataset.value) === 0 &&
				currentTile !== tile &&
				tile?.dataset.status !== "flag"
			)
				showAroundTile(currentTile);

			showTile(currentTile);
		}

		// Go to the next row
		temp += actualBoardSize;
	}
};

const showAllBombs = function () {
	minesLeftText.textContent = "You hit the mine :(";
	endOfGame = true;
	minesweeperTitle.textContent = "You Lost!";
	minesweeperTitle.style.color = "red";
	[...board.children].forEach((el) => {
		if (el.dataset.status === "hidden" && el?.id === "mine") {
			el.dataset.status = "mine";
		}
	});
};

// Main event listeners
board.addEventListener("click", function (e) {
	// Prevent unnecessary events from happening
	if (e.target.dataset.status === "flag" || endOfGame) return;

	if (e.target.id === "mine") {
		showAllBombs();
	} else if (e.target.dataset.status === "hidden") {
		// spreadRow(e.target);
		if (Number(e.target.dataset.value) > 0) {
			showTile(e.target);
			return;
		}
		showAroundTile(e.target);
	}

	// Check if player have won
	if (
		![...board.children].find(
			(el) =>
				(el.dataset.status === "hidden" && el?.id !== "mine") ||
				(el.dataset.status === "flag" && el?.id !== "mine")
		)
	) {
		endOfGame = true;
		minesLeftText.textContent = "";
		minesweeperTitle.textContent = "You won!";
		minesweeperTitle.style.color = "green";
	}
});

// Right click handling
board.addEventListener("contextmenu", function (e) {
	e.preventDefault();
	// Prevent from doing anything when it's end of the game
	if (endOfGame) return;

	if (e.target.dataset.status === "flag") {
		e.target.dataset.status = "hidden";
		minesLeftText.textContent = `Mines Left: ${++minesLeft}`;
	} else if (e.target.dataset.status === "hidden") {
		e.target.dataset.status = "flag";
		minesLeftText.textContent = `Mines Left: ${--minesLeft}`;
	}
});
