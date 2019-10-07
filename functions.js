var game = [],
    past = [],
    timing,
    timer,
    grid,
    midY,
    midX,
    play = false,
    chaos = false,
    border = false,
    tank = false,
    canvas = document.getElementById("game"),
    ctx = canvas.getContext("2d"),
    mousedown = false,
    life,
    canvasx = canvas.offsetLeft,
    canvasy = canvas.offsetTop,
    size = document.getElementsByClassName("size");


buildGame();
timing = 1000 / Number(document.getElementById("fps").value);


Array.from(size).forEach(function(element){
    element.addEventListener("change", buildGame);
});

document.getElementById("fps").addEventListener("change", function(){
    timing = 1000 / Number(document.getElementById("fps").value);
    if(play){
        clearInterval(timer);
        timer = setInterval(nextGen, timing);
    }
});

document.getElementById("game").addEventListener("mousedown", function(e){
    var y = Math.floor((e.clientY - canvasy) / grid),
        x = Math.floor((e.clientX - canvasx) / grid);
    mousedown = true;
    life = !game[y][x];
    draw([{y:y, x:x}]);
});

document.getElementById("game").addEventListener("mousemove", function(e){
    var y = Math.floor((e.clientY - canvasy) / grid),
        x = Math.floor((e.clientX - canvasx) / grid);
    if(mousedown){
        maybe(y, x, life);
    }
});

document.addEventListener("mouseup", function(){
    mousedown = false;
});

document.getElementById("next").addEventListener("click", nextGen);

document.getElementById("play").addEventListener("click", function(){
    if(play){
        clearInterval(timer);
    } else {
        timer = setInterval(nextGen, timing);
    }
    play = buttonSwitch(this, ["next"], play, false);
});

document.getElementById("clear").addEventListener("click", function(){
    for(y = 0; y < game.length; y++){
        for(x = 0; x < game[0].length; x++){
            maybe(y, x, false);
        }
    }
    if(play){
        document.getElementById("play").click();
    }
});

document.getElementById("chaos").addEventListener("click", function(){
    chaos = buttonSwitch(this, ["borderB", "tankB"], chaos, false);
});

document.getElementById("borderB").addEventListener("click", function(){
    border = buttonSwitch(this, ["chaos"], border, tank);
});

document.getElementById("tankB").addEventListener("click", function(){
    tank = buttonSwitch(this, ["chaos"], tank, border);
});

document.getElementById("border").addEventListener("click", function(){
    for(i = 0; i < game.length || i < game[0].length; i++){
        if(i < game.length){
            maybe(i, 0, true);
            maybe(i, game[0].length - 1, true);
        }
        if(i < game[0].length){
            maybe(0, i, true);
            maybe(game.length - 1, i, true);
        }
    }
});

document.getElementById("tank").addEventListener("click", function(){
    maybe(midY, midX, true);
    maybe(midY - 1, midX, true);
    maybe(midY, midX - 1, true);
    maybe(midY, midX + 1, true);
    maybe(midY + 1, midX - 1, true);
    maybe(midY + 1, midX + 1, true);
});

document.getElementById("test").addEventListener("click", function(){
    var start = Date.now();
    for(i = 0; i < 1000; i++){
        nextGen();
    }
    var result = Date.now() - start;
    console.log(result + "ms");
});


function buildGame(){
    var calc = game.map(function(item){
        return item.slice();
    });
    var y = Number(document.getElementById("y").value),
        x = Number(document.getElementById("x").value),
        row = [];
    grid = Number(document.getElementById("grid").value);
    game.splice(0, game.length);
    midY = Math.floor(y / 2);
    midX = Math.floor(x / 2);
    while(row.length < x){
        row.push(false);
    }
    while(game.length < y){
        game.push(row.slice());
    }
    canvas.height = y * grid;
    canvas.width = x * grid;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    for(i = 0; i < y + 1 || i < x + 1; i++){
        if(i < y + 1){
            ctx.moveTo(0, i * grid);
            ctx.lineTo(canvas.width, i * grid);
        }
        if(i < x + 1){
            ctx.moveTo(i * grid, 0);
            ctx.lineTo(i * grid, canvas.height);
        }
    }
    ctx.stroke();
    for(y2 = 0; y2 < calc.length && y2 < game.length; y2++){
        for(x2 = 0; x2 < calc[y2].length && x2 < game[y2].length; x2++){
            maybe(y2, x2, calc[y2][x2]);
        }
    }
}

function draw(temp){
    temp.forEach(function(item){
        if(game[item.y][item.x]){
            game[item.y][item.x] = false;
            ctx.fillStyle = "#fff";
        } else {
            game[item.y][item.x] = true;
            ctx.fillStyle = "#000";
        }
        ctx.fillRect(item.x * grid + 1, item.y * grid + 1, grid - 2, grid - 2);
    });
}

function maybe(y, x, hold){
    if(game[y][x] !== hold){
        draw([{y:y, x:x}]);
    }
}

function nextGen(){
    var temp = [];
    for(y = 0; y < game.length; y++){
        for(x = 0; x < game[y].length; x++){
            var count = neighbors(y, x, false);
            if(game[y][x]){
                if(count < 2 || count > 3){
                    temp.push({y:y, x:x});
                }
            } else {
                if(count == 3){
                    temp.push({y:y, x:x});
                }
            }
        }
    }
    draw(temp);
    if(chaos){
        var y = Math.floor(Math.random() * game.length),
            x = Math.floor(Math.random() * game[y].length);
        maybe(y, x, true);
        if(play && temp.length < 2){
            document.getElementById("border").click();
        }
    } else if(border || tank){
        var state = false,
            tempLength = temp.length;
        for(i = 0; i < past.length && state === false; i++){
            if(past[i].length == tempLength){
                var state2 = true;
                for(i2 = 0; i2 < tempLength && state2; i2++){
                    if(past[i][i2].y != temp[i2].y || past[i][i2].x != temp[i2].x){
                        state2 = false;
                    }
                }
                state = state2;
            }
        }
        if(state){
            if(border){
                document.getElementById("border").click();
            } 
            if(tank){
                document.getElementById("tank").click();
            }
        }
        past.push(temp.slice());
        if(past.length > 20){
            past.shift();
        }
    }
}

function neighbors(y, x, r){
    var count = 0;
    for(var i = -1; i < 2; i += 2){
        if(r){
            count += check(y, x + i);
        } else {
            count += check(y + i, x);
            count += check(y, x + i);
            count += neighbors(y + i, x, true);
        }
    }
    return count;
}

function check(y, x){
    if(y >= 0 && x >= 0 && y < game.length && x < game[y].length && game[y][x]){
        return 1;
    }
    return 0;
}

function buttonSwitch(thisButton, otherButtons, thisVar, otherVar){
    if(thisVar){
        if(otherVar === false){
            otherButtons.forEach(function(item){
                document.getElementById(item).disabled = false;
            });
        }
    } else {
        otherButtons.forEach(function(item){
            document.getElementById(item).disabled = true;
        });
    }
    thisButton.classList.toggle("active");
    thisVar = !thisVar;
    return thisVar;
}