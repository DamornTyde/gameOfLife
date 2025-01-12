//menu
const heightInput = document.querySelector('#y');
const widthInput = document.querySelector('#x');
const sizeInput = document.querySelector('#grid');
const size = document.querySelectorAll('.size');

const fps = document.querySelector('#fps');

const next = document.querySelector('#next');
const play = document.querySelector('#play');
const clear = document.querySelector('#clear');
const chaos = document.querySelector('#chaos');
const autoBorder = document.querySelector('#borderB');
const autoTank = document.querySelector('#tankB');
const autoRandom = document.querySelector('#randomB');
const border = document.querySelector('#border');
const tank = document.querySelector('#tank');
const random = document.querySelector('#random');

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');

//memory
let gameHeight = Number(heightInput.value);
let gameWidth = Number(widthInput.value);
let grid = Number(sizeInput.value);

let game = buildArray();
let change = [];
const history = [];

let mousedown = false;
let life = false;

let fpsInterval = 1000 / fps.value;
let then;
let animate = false;

let chaosTheory = false;
let borderA = false;
let tankA = false;
let randomA = false;

//objects
class coor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

//input
canvas.addEventListener('mousedown', e => {
    const x = row(e);
    const y = colom(e);
    mousedown = true;
    life = !game[x][y];
    flip(new coor(x, y));
});

canvas.addEventListener('mousemove', e => {
    const cell = new coor(row(e), colom(e));
    if (mousedown && cellExist(cell)) {
        maybe(cell, life);
    }
});

document.addEventListener('mouseup', () => {
    mousedown = false;
});

document.querySelectorAll('.size').forEach(e => e.addEventListener('change', () => {
    const temp = game.map(i => i);
    gameHeight = Number(heightInput.value);
    gameWidth = Number(widthInput.value);
    grid = Number(sizeInput.value);
    game = buildArray();
    buildGame();
    temp.forEach((r, x) => r.forEach((c, y) => {
        const cell = new coor(x, y);
        if (cellExist(cell)) {
            maybe(cell, c);
        }
    }));
}));

fps.addEventListener('change', () => {
    fpsInterval = 1000 / fps.value;
});

next.addEventListener('click', calc);

play.addEventListener('click', () => {
    if (animate) {
        animate = !animate;
        play.classList.remove('active');
    } else {
        animate = !animate;
        then = window.performance.now();
        requestAnimationFrame(newGen);
        play.classList.add('active');
    }
});

clear.addEventListener('click', () => {
    game.forEach((r, x) => r.keys().forEach(y => maybe(new coor(x, y), false)));
    if (animate) {
        play.click();
    }
    if (chaosTheory) {
        chaos.click();
    }
    if (borderA) {
        autoBorder.click();
    }
    if (tankA) {
        autoTank.click();
    }
    if (randomA) {
        autoRandom.click();
    }
});

chaos.addEventListener('click', () => {
    if (chaosTheory) {
        chaosTheory = !chaosTheory;
        chaos.classList.remove('active');
    } else {
        chaosTheory = !chaosTheory;
        chaos.classList.add('active');
    }
});

autoBorder.addEventListener('click', () => {
    if (borderA) {
        borderA = !borderA;
        autoBorder.classList.remove('active');
    } else {
        borderA = !borderA;
        autoBorder.classList.add('active');
    }
});

autoTank.addEventListener('click', () => {
    if (tankA) {
        tankA = !tankA;
        autoTank.classList.remove('active');
    } else {
        tankA = !tankA;
        autoTank.classList.add('active');
    }
});

autoRandom.addEventListener('click', () => {
    if (randomA) {
        randomA = !randomA;
        autoRandom.classList.remove('active');
    } else {
        randomA = !randomA;
        autoRandom.classList.add('active');
    }
});

border.addEventListener('click', () => {
    if (gameHeight > gameWidth) {
        game.keys().forEach(gameBorder);
    } else {
        game[0].keys().forEach(gameBorder);
    }
});

tank.addEventListener('click', () => {
    const middle = new coor(Math.floor(gameHeight / 2), Math.floor(gameWidth / 2));
    tankPart(middle);
    for (let i = -1; i < 2; i += 2) {
        tankPart(new coor(middle.x + 1, middle.y + i));
    }
});

random.addEventListener('click', () => {
    game.forEach((r, x) => r.keys().forEach(y => {
        if (Math.random() > .5) {
            flip(new coor(x, y))
        }
    }));
});

//functions
function buildArray() {
    return Array(Number(gameHeight)).fill().map(() => Array(Number(gameWidth)).fill(false));
}

function cellExist(cell) {
    return cell.x > -1 && cell.x < game.length && cell.y > -1 && cell.y < game[cell.x].length;
}

function buildGame() {
    canvas.height = (grid + 1) * gameHeight + 1;
    canvas.width = (grid + 1) * gameWidth + 1;
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    game.forEach((r, x) => r.keys().forEach(y => draw(new coor(x, y))));
}

function calc() {
    change = [];
    game.map((r, x) => r.map((state, y) => {
        const cell = new coor(x, y);
        const score = darwin(cell);
        if (state) {
            return score < 2 || score > 3 ? cell : [];
        }
        return score === 3 ? cell : [];
    })).forEach(flip);
    if (chaosTheory) {
        if (game.map(r => r.filter(c => c)).flat().length === 0) {
            border.click();
        }
        maybe(new coor(Math.floor(Math.random() * game.length), Math.floor(Math.random() * game[0].length)), true);
    }
    if ([borderA, tankA, randomA].findIndex(i => i) > -1) {
        if (history.filter(i => i.length === change.length).findIndex(r => r.map((i, c) => i.x === change[c].x && i.y === change[c].y ? [] : c).flat().length === 0) > -1) {
            if (borderA) {
                border.click();
            }
            if (tankA) {
                tank.click();
            }
            if (randomA) {
                random.click();
            }
        }
    }
    history.push(change);
    if (history.length > 100) {
        history.shift();
    }
}

function draw(cell) {
    ctx.fillStyle = game[cell.x][cell.y] ? 'black' : 'white';
    ctx.fillRect((grid + 1) * cell.y + 1, (grid + 1) * cell.x + 1, grid, grid);
}

function flip(cell) {
    if (Array.isArray(cell)) {
        cell.forEach(flip);
    } else {
        game[cell.x][cell.y] = !game[cell.x][cell.y];
        change.push(cell);
        draw(cell);
    }
}

function maybe(cell, hold) {
    if (game[cell.x][cell.y] !== hold) {
        flip(cell);
    }
}

function alive(cell) {
    return cellExist(cell) && game[cell.x][cell.y] ? 1 : 0;
}

function darwin(cell, rec = 0) {
    let sum = 0;
    for (let i = -1; i < 2; i += 2) {
        sum += alive(new coor(cell.x + i, cell.y + rec));
        if (rec === 0) {
            sum += alive(new coor(cell.x, cell.y + i));
            sum += darwin(cell, i);
        }
    }
    return sum;
}

function newGen() {
    if (animate) {
        requestAnimationFrame(newGen);
        const now = window.performance.now();
        const elapsed = now - then;
        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);
            calc();
        }
    }
}

function gameBorder(i) {
    const temp = [];
    temp.push(new coor(0, i));
    temp.push(new coor(gameHeight - 1, i));
    temp.push(new coor(i, 0));
    temp.push(new coor(i, gameWidth - 1));
    temp.filter(cellExist).forEach(c => maybe(c, true));
}

function tankPart(cell) {
    const temp = [];
    temp.push(new coor(cell.x, cell.y));
    temp.push(new coor(cell.x -1, cell.y));
    temp.filter(cellExist).forEach(c => maybe(c, true));
}

function row(e) {
    return Math.floor((e.clientY - canvas.offsetTop) / (grid + 1));
}

function colom(e) {
    return Math.floor((e.clientX - canvas.offsetLeft) / (grid + 1));
}

//autoplay
buildGame();