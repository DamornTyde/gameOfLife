$(document).ready(function(){
    //variables
    var game = [],
        calc,
        grid = 10,
        timing,
        timer,
        mem = "";
        play = false,
        canvas = document.getElementById("game"),
        ctx = canvas.getContext("2d");


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

    $(document).on("click", ".cell", function(){
        var y = Number($(this).data("y")),
            x = Number($(this).data("x"));
        draw(y, x);
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

    $(document).on("click", "#mem", function(){
        var consent = true;
        if(mem.length > 0){
            consent = confirm("Are you sure you want to overwrite your memory?");
        }
        if(consent){
            mem = save();
            console.log(mem);
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
        for(i = 0; i < y; i++){
            content += "<tr>";
            for(i2 = 0; i2 < x; i2++){
                content += "<td><button class='cell' data-y='" + i + "' data-x='" + i2 + "'></button></td>";
            }
            content += "</tr>";
        }
        $("#menu").html(content + "</table>");
        canvas.height = y * grid;
        canvas.width = x * grid;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function draw(y, x){
        if(game[y][x]){
            game[y][x] = false;
            ctx.fillStyle = "#fff";
        } else {
            game[y][x] = true;
            ctx.fillStyle = "#000";
        }
        ctx.fillRect(x * grid, y * grid, grid, grid);
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

    function save(){
        var content = {y:game.length, x:game[0].length, save:""},
            i = 0,
            i2 = 1,
            temp = 0;
            temp2 = "";
        for(y = 0; y < game.length; y++){
            for(x = 0; x < game[y].length; x++, i++, i2 = i2 * 2){
                if(i == 16){
                    i = 0;
                    i2 = 1;
                    temp2 += String.fromCodePoint(temp);
                    temp = 0;
                }
                if(game[y][x]){
                    temp += i2;
                }
            }
        }
        content.save = temp2;
        return content;
    }
});