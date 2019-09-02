$(document).ready(function(){
    var game = [],
        calc,
        timing,
        timer,
        grid,
        midY,
        midX,
        play = false,
        chaos = false,
        canvas = document.getElementById("game"),
        ctx = canvas.getContext("2d"),
        mousedown = false,
        life,
        temp = [],
        canvasx = $(canvas).offset().left,
        canvasy = $(canvas).offset().top;


    buildGame();
    timing = 1000 / Number($("#fps").val());


    $(document).on("change", ".size", function(){
        buildGame();
    }).on("change", "#fps", function(){
        timing = 1000 / Number($("#fps").val());
        if(play){
            clearInterval(timer);
            timer = setInterval(nextGen, timing);
        }
    }).on("mousedown", "#game", function(e){
        var y = Math.floor((e.clientY - canvasy) / grid),
            x = Math.floor((e.clientX - canvasx) / grid);
        mousedown = true;
        life = !game[y][x];
        draw([{y:y, x:x}]);
    }).on("mousemove", "#game", function(e){
        var y = Math.floor((e.clientY - canvasy) / grid),
            x = Math.floor((e.clientX - canvasx) / grid);
        if(mousedown){
            maybe(y, x, life);
        }
    }).on("mouseup", function(){
        mousedown = false;
    }).on("click", "#next", function(){
        nextGen();
    }).on("click", "#play", function(){
        if(play){
            clearInterval(timer);
            play = false;
            $("#next").prop("disabled", false);
            $(this).removeClass("active");
        } else {
            timer = setInterval(nextGen, timing);
            play = true;
            $("#next").prop("disabled", true);
            $(this).addClass("active");
        }
    }).on("click", "#clear", function(){
        for(y = 0; y < game.length; y++){
            for(x = 0; x < game[0].length; x++){
                maybe(y, x, false);
            }
        }
        if(play){
            $("#play").click();
        }
    }).on("click", "#chaos", function(){
        if(chaos){
            chaos = false;
            $(this).removeClass("active");
        } else {
            chaos = true;
            $(this).addClass("active");
        }
    }).on("click", "#border", function(){
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
    }).on("click", "#tank", function(){
        maybe(midY, midX, true);
        maybe(midY - 1, midX, true);
        maybe(midY, midX - 1, true);
        maybe(midY, midX + 1, true);
        maybe(midY + 1, midX - 1, true);
        maybe(midY + 1, midX + 1, true);
    }).on("click", "#test", function(){
        var start = Date.now();
        for(i = 0; i < 1000; i++){
            nextGen();
        }
        var result = Date.now() - start;
        console.log(result + "ms");
    });


    function buildGame(){
        calc = game.map(function(item){
            return item.slice();
        });
        var y = Number($("#y").val()),
            x = Number($("#x").val()),
            row = [],
            content = "<table>";
        grid = Number($("#grid").val());
        game.splice(0, game.length);
        midY = Math.floor(y / 2);
        midX = Math.floor(x / 2);
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
        for(y2 = 0; y2 < calc.length && y2 < game.length; y2++){
            for(x2 = 0; x2 < calc[y2].length && x2 < game[y2].length; x2++){
                maybe(y2, x2, calc[y2][x2]);
            }
        }
    }

    function draw(temp2){
        temp2.forEach(function(item){
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
        temp.splice(0, temp.length);
        for(y = 0; y < game.length; y++){
            for(x = 0; x < game[y].length; x++){
                calculate(y, x);
            }
        }
        if(chaos){
            var y = Math.floor(Math.random() * game.length),
                x = Math.floor(Math.random() * game[y].length);
            maybe(y, x, true);
        }
        if(play && chaos && temp.length < 2){
            $("#border").click();
        }
        draw(temp);
    }

    function calculate(y, x){
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
});