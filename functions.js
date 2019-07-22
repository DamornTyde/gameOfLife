$(document).ready(function(){
    //variables
    var game = [],
        calc,
        timing,
        timer,
        grid = 10,
        play = false,
        canvas = document.getElementById("game"),
        ctx = canvas.getContext("2d"),
        mousedown = false,
        life,
        canvasx = $(canvas).offset().left,
        canvasy = $(canvas).offset().top;


    //autoplay
    buildGame();
    timing = 1000 / Number($("#fps").val());


    //events
    $(document).on("change", ".size", function(){
        buildGame();
    });

    $(document).on("change", "#fps", function(){
        timing = 1000 / Number($("#fps").val());
        if(play){
            clearInterval(timer);
            timer = setInterval(nextGen, timing);
        }
    });

    $(document).on("mousedown", "#game", function(e){
        var y = Math.floor((e.clientY - canvasy) / grid),
            x = Math.floor((e.clientX - canvasx) / grid);
        mousedown = true;
        if(game[y][x]){
            life = false;
        } else {
            life = true;
        }
        draw(y, x);
    });

    $(document).on("mousemove", "#game", function(e){
        var y = Math.floor((e.clientY - canvasy) / grid),
            x = Math.floor((e.clientX - canvasx) / grid);
        if(mousedown){
            maybe(y, x, life);
        }
    });

    $(document).on("mouseup", "#game", function(){
        mousedown = false;
    });

    $(document).on("click", "#next", function(){
        nextGen();
    });

    $(document).on("click", "#play", function(){
        if(play){
            clearInterval(timer);
            play = false;
            $("#next").prop("disabled", false);
        } else {
            timer = setInterval(nextGen, timing);
            play = true;
            $("#next").prop("disabled", true);
        }
    });


    //functions
    function buildGame(){
        var y = Number($("#y").val()),
            x = Number($("#x").val()),
            row = [],
            content = "<table>";
        game.splice(0, game.length);
        while(row.length < x){
            row.push(false);
        }
        while(game.length < y){
            game.push(row.slice());
        }
        $("#menu").html(content + "</table>");
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
    }

    function draw(y, x){
        if(game[y][x]){
            game[y][x] = false;
            ctx.fillStyle = "#fff";
        } else {
            game[y][x] = true;
            ctx.fillStyle = "#000";
        }
        ctx.fillRect(x * grid + 1, y * grid + 1, grid - 2, grid - 2);
    }

    function maybe(y, x, hold){
        if(game[y][x] !== hold){
            draw(y, x);
        }
    }

    function nextGen(){
        calc = game.map(function(item){
            return item.slice();
        });
        for(y = 0; y < game.length; y++){
            for(x = 0; x < game[y].length; x++){
                calculate(y, x);
            }
        }
    }

    function calculate(y, x){
        var count = neighbors(y, x, false);
        if(game[y][x]){
            if(count < 2 || count > 3){
                draw(y, x);
            }
        } else {
            if(count == 3){
                draw(y, x);
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
        if(y >= 0 && x >= 0 && y < game.length && x < game[y].length && calc[y][x]){
            return 1;
        }
        return 0;
    }
});