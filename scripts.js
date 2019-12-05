/**
 * @type {HTMLElement}
 */
const wrap = document.querySelector("#wrap");
/**
 * @type {HTMLElement}
 */
const ui = document.querySelector("#ui");
/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const startScreen = document.querySelector("#start-screen");
const gameScreen = document.querySelector("#game-screen");
const endScreen = document.querySelector("#end-screen");

const wonszVideo = endScreen.querySelector("video");

const display = {};

const board = {
	width: 0,
	height: 0,
	render: () => {
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, display.width, display.height);
		ctx.fillStyle = "white";
		ctx.fillRect(display.offsetX, display.offsetY, display.cellSize * board.width, display.cellSize * board.height);
	}
}

const snake = {
	sections: [], // segmenty
	direction: 'right', // w którą stron epatrzy wonsz
	/* dodanie głowy */
	addHead: (x, y) => {
		snake.sections = [Section(x, y)].concat(snake.sections);
		if (snake.sections.length > 1) snake.sections[1].head = false;
	},
	/* usunięcie ogona */
	removeTail() {
		if (snake.sections.length > 1) snake.sections.pop();
	},
	/* narysowanie wszystkich segmentów wonsza */
	render: () => {
		snake.sections.forEach(renderSection);
	}
}
function Section(x, y) {
	/* współrzędne segmentu i informacja czy jest głową*/
	return {
		x,
		y,
		head: true
	}
}
function renderSection(section) {
	/* rysowanie pojdynczego segmentu wonsza */
	ctx.fillStyle = section.head ? "red" : "black";
	ctx.fillRect(	display.offsetX + section.x * display.cellSize,
						display.offsetY + section.y * display.cellSize,
						display.cellSize,
						display.cellSize);
}
function move() {
	/* ustalenie nowych współrzędnych głowy wonsza */
	let { x, y } = snake.sections[0];
	if (snake.direction === 'right') x++;
	if (snake.direction === 'left') x--;
	if (snake.direction === 'down') y++;
	if (snake.direction === 'up') y--;

	/* sprawdzenie czy wonsz umarł (wszedł w ścianę lub siebie) */
	for (const el of snake.sections) {
		if(el.x === x && el.y === y) gameOver();
	}
	if(x < 0) gameOver();
	if(y < 0) gameOver();
	if(x >= board.width) gameOver();
	if(y >= board.height) gameOver();

	/* dodanie głowy wonsza */
	snake.addHead(x, y);


	/* usunięcie ogona wonsza */
	snake.removeTail();
}

let gameState = 'not-started';
const stats = {
	speed: 3, // kwadraty pokonywane na sekundę
	points: 0 // zebrane punkty
}

let timeoutID = 0;
function step() {
	move()// przesunąć wonsza
	board.render()// narysować planszę
	snake.render()// narysować wonsza

	// policzenie iedy wykonać kolejny krok
	const nextStepTimeout = 1000 * (1 / stats.speed);
	// zlecenie nastepnego kroku wonsza za pewien czas
	if(gameState === "ongoing") timeoutID = setTimeout(step, nextStepTimeout)
}





function gameStart() {
	gameState = "ongoing";
	startScreen.classList.add("disabled");
	gameScreen.classList.remove("disabled");

	display.height = canvas.height = canvas.offsetHeight;
	display.width = canvas.width = canvas.offsetWidth;
	display.cellSize = 20; // in pixels
	display.offsetX = Math.floor((display.width % display.cellSize) / 2);
	display.offsetY = Math.floor((display.height % display.cellSize) / 2);

	board.width = Math.floor(display.width / display.cellSize);
	board.height = Math.floor(display.height / display.cellSize);

	let x = Math.floor(board.width / 2);
	let y = Math.floor(board.height / 2);

	snake.addHead(x - 4, y);
	snake.addHead(x - 3, y);
	snake.addHead(x - 2, y);
	snake.addHead(x - 1, y);
	snake.addHead(x, y);
	step();
}
function gameOver() {
	gameState = "over";
	clearTimeout(timeoutID);
	gameScreen.classList.add("disabled");
	endScreen.classList.remove("disabled");
	document.querySelector("#end-screen-points").innerText = `you lost with ${stats.points} points`;
	wonszVideo.play();
}

function arrow(direction) {
	if(gameState !== "ongoing") return; // nie rób kroku jezeli nie trwa rozgrywka
	if(direction === 'ArrowUp' && snake.direction !== "down") 
		snake.direction = "up";
	if(direction === 'ArrowDown' && snake.direction !== "up") 
		snake.direction = "down";
	if(direction === 'ArrowLeft' && snake.direction !== "right") 
		snake.direction = "left";
	if(direction === 'ArrowRight' && snake.direction !== "left") 
		snake.direction = "right";
	clearTimeout(timeoutID);
	step();
}

window.addEventListener("keydown", function(event){
	if(event.code === "Space" && gameState === "not-started"){
		gameStart();
	}
	if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.code))
		arrow(event.code);
});