//let playerName = prompt('Palun sisesta oma nimi')

let returnColor = "rgb(30, 5, 68)";
let currentTheme = "dark-blue";

class Typer{
    constructor(){
        this.name = "Anonüümne"; //kasutaja nimi, mida ta peab mängu alguses sisestam
        this.wordsInGame = 3; //mitu sõna peab trükkima, et mäng lõppeks
        this.wordsTyped = 0; //mitu sõna on trükitud
        this.startingWordLength = 3; //esimese sõna pikkus
        this.words = []; //need sõnad, mis tulevad lemmade failist
        this.typeWords = []; //need sõnad, mida hakkame trükkima
        this.word = "aabits"; //sõna, mida peab trükkima
        this.startTime = 0; //mängu algusaeg
        this.endTime = 0; // mängu lõpuaeg
        this.results = [];
        this.chars = 0;

        this.loadFromFile();
    }

    loadFromFile(){
        $.get("lemmad2013.txt", (data) => this.getWords(data));

        $.get("database.txt", (data)=>{
            let content = JSON.parse(data).content;
            this.results = content;
            console.log(this.results);
        })
    }

    getWords(data){
        //console.log(data);
        const dataFromFile = data.split('\n');
        this.separateWordsByLength(dataFromFile);
    }

    separateWordsByLength(data){
        for(let i = 0; i < data.length; i++){
            const wordLength = data[i].length;

            if(this.words[wordLength] === undefined){
                this.words[wordLength] = [];
            }

            this.words[wordLength].push(data[i]);
        }

        console.log(this.words)

        //console.log(this.words);
        $('#submitName').click(
            ()=>{
                this.name = $('#nameValue').val();
                this.startingWordLength = parseFloat($('#startingWordLength').val());
                this.wordsInGame = parseFloat($('#wordsInGame').val());
                if(this.startingWordLength+this.wordsInGame > 31){
                    $('#error').show();
                } else {
                    $('#name').hide();

                    this.startTyper();
                    this.startOnce();
                }

            }
        );
    }

    startOnce(){
        $(document).on("keypress", (event)=>this.shortenWord(event.key));
        $('#restart').on('click', ()=>this.startTyper());
        $('#myBtn').on('click', () => {$("#myModal").css("display", "block");});
        $('.close').on('click', () => {$("#myModal").css("display", "none");});
        $('.close2').on('click', () => {$("#result-image").css("display", "none");});
        $('#theme').on('mousedown', function(){
            var selectedValue = $(this).val();
            console.log("Selected value: " + selectedValue);
            typer.changeTheme(selectedValue);
        })
        $(window).on("click", function(event) {
            if (event.target == $("#myModal")[0]) {
                $("#myModal").css("display", "none");
            }
        })
        this.updateResults();
    }

    startTyper(){
        $('#restart, #score').hide();
        this.wordsTyped = 0;
        this.generateWords();
        this.updateInfo();
        this.startTime = performance.now();
        console.log(this.startingWordLength);
    }

    updateInfo(){
        $('#gameinfo').html((this.wordsTyped + 1) + ". sõna " + this.wordsInGame + "-st");
    }

    shortenWord(keypressed){
        //console.log(keypressed);

        if(this.word.charAt(0) != keypressed){
            document.getElementById('container').style.backgroundColor = "lightpink";
            setTimeout(function(){
                document.getElementById('container').style.backgroundColor = returnColor;
            }, 100);
        }

        if(this.word.length > 1 && this.word.charAt(0) == keypressed){
            this.word = this.word.slice(1);
            this.drawWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped != this.wordsInGame - 1){
            this.wordsTyped++;
            this.selectWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped == this.wordsInGame - 1){
            this.endTime = performance.now();
            this.word = this.word.slice(1);
            this.drawWord();
            $('#score').html(this.name + ", sinu aeg oli: " + ((this.endTime-this.startTime)/1000).toFixed(2) + " sekundit.");
            this.saveResults();
            $('#restart, #score').show();
        }
    }



    generateWords(){
        for(let i = 0; i < this.wordsInGame; i++){
            const wordLength = this.startingWordLength + i;
            const randomWord = Math.round(Math.random() * 
            this.words[wordLength].length);
            //console.log(wordLength, randomWord);

            this.typeWords[i] = this.words[wordLength][randomWord];
        }
        console.log(this.typeWords);
        this.selectWord();
    }

    selectWord(){
        this.word = this.typeWords[this.wordsTyped];
        this.drawWord();
    }

    drawWord(){
        $('#wordDiv').html(this.word);
        this.updateInfo();
    }

    saveResults(){
        this.chars = 0;
        for(let i = 0; i < this.wordsInGame; i++){
            this.chars = this.chars + this.startingWordLength + i;
            console.log(this.chars);
        }
        
        let wordsPerMinute = ((this.chars/((this.endTime-this.startTime)/1000)) * 60).toFixed(0);
        console.log(wordsPerMinute);


        let result = {
            name: this.name,
            time: ((this.endTime-this.startTime)/1000).toFixed(2),
            words: this.wordsInGame,
            chars: this.chars,
            wordsPerMin: wordsPerMinute
        }

        this.results.push(result);

        this.results.sort((a, b) => parseFloat(b.wordsPerMin) - parseFloat(a.wordsPerMin));

        this.updateResults();

        $('#modal-results2').html("");

        $("#modal-results2").append("<p>Sinu WPM on " + wordsPerMinute + "</p>");

        if(wordsPerMinute < 40){
            $("#modal-results2").append("<p class='adjust-text'>Alla keskmise (< 40).</p>");
            $("#modal-results2").append("<img src='media/speed-slow.jpg' alt='Aeglane' class='fit-image'>");
        }
        if(wordsPerMinute >= 40 && wordsPerMinute < 50){
            $("#modal-results2").append("<p class='adjust-text'>Keskmine kiirus (40-49).</p>");
            $("#modal-results2").append("<img src='media/speed-average.jpg' alt='Keskmine kiirus' class='fit-image'>");
        }
        if(wordsPerMinute >= 50 && wordsPerMinute < 60){
            $("#modal-results2").append("<p class='adjust-text'>Üle keskmise (50-59).</p>");
            $("#modal-results2").append("<img src='media/speed-fast.jpg' alt='kiire' class='fit-image'>");
        }
        if(wordsPerMinute >= 60 && wordsPerMinute < 70){
            $("#modal-results2").append("<p class='adjust-text'>Produktiivne kiirus (60-69).</p>");
            $("#modal-results2").append("<img src='media/speed-faster.jpg' alt='Kiirem' class='fit-image'>");
        }
        if(wordsPerMinute >= 70 && wordsPerMinute< 120){
            $("#modal-results2").append("<p class='adjust-text'>Väga kiire (70-119).</p>");
            $("#modal-results2").append("<img src='media/speed-fastest.jpg' alt='Väga kiire' class='fit-image'>");
        }
        if(wordsPerMinute >= 120){
            $("#modal-results2").append("<p class='adjust-text'>Konkurentsivõimeline kiirus (120+).</p>");
            $("#modal-results2").append("<img src='media/speed-extreme.jpg' alt='Kõike kiirem' class='fit-image'>");
        }
        
        $('#result-image').css("display", "block");

        $.post('server.php', {save: this.results}).done(
            function(){
                console.log("Success");
            }
        );
    }

    updateResults(){

        // Code generated by chatgpt.

        $('#modal-results').html("");

        const table = $("<table class='result-table'></table>"); 
        const headerRow = $("<tr></tr>");
        headerRow.append("<th>#</th>");
        headerRow.append("<th>Nimi</th>");
        headerRow.append("<th>Aeg</th>");
        headerRow.append("<th>Sõnu</th>");
        headerRow.append("<th>Tähti</th>");
        headerRow.append("<th>WPM</th>");
        table.append(headerRow);

        for (let i = 0; i < this.results.length && i < 10; i++) {
            const result = this.results[i];
            const row = $("<tr></tr>");
            row.append("<td>" + (i + 1) + "</td>");
            row.append("<td>" + result.name + "</td>");
            row.append("<td>" + result.time + "</td>");
            row.append("<td>" + result.words + "</td>");
            row.append("<td>" + result.chars + "</td>");
            row.append("<td>" + result.wordsPerMin + "</td>");
            table.append(row);
        }

        if(currentTheme === "dark-blue"){
            $('.modal-content').css('background-color', 'rgb(30, 5, 68)');
            $('th').css('background-color', 'rgb(16, 3, 36)');
        }
        if(currentTheme === "yellow"){
            $('.modal-content').css('background-color', 'rgb(208, 206, 84)');
            $('th').css('background-color', 'rgb(190, 187, 25)');
        }
        if(currentTheme === "green"){
            $('.modal-content').css('background-color', 'rgb(141, 217, 103)');
            $('th').css('background-color', 'rgb(78, 181, 26)');
        }
        if(currentTheme === "red"){
            $('.modal-content').css('background-color', 'rgb(202, 28, 28)');
            $('th').css('background-color', 'rgb(151, 13, 13)');
        }

        $("#modal-results").append(table);
    }

    changeTheme(theme){

        currentTheme = theme;

        if(theme === "dark-blue"){
            $('body').css('color', 'white');
            $('#container').css({'background-color': 'rgb(30, 5, 68)', 'border': '1vw solid rgb(16, 3, 36)'});
            $('#info').css('background-color', 'rgb(16, 3, 36)');
            $('#results').css('background-color', 'rgb(16, 3, 36)');
            $('.modal-content').css('background-color', 'rgb(30, 5, 68)');
            $('th').css('background-color', 'rgb(16, 3, 36)');
            returnColor = "rgb(30, 5, 68)"
        }
        if(theme === "yellow"){
            $('body').css('color', 'black');
            $('#container').css({'background-color': 'rgb(208, 206, 84)', 'border': '1vw solid rgb(190, 187, 25)'});
            $('#info').css('background-color', 'rgb(190, 187, 25)');
            $('#results').css('background-color', 'rgb(190, 187, 25)');
            $('.modal-content').css('background-color', 'rgb(208, 206, 84)');
            $('th').css('background-color', 'rgb(190, 187, 25)');
            returnColor = "rgb(208, 206, 84)"
        }
        if(theme === "green"){
            $('body').css('color', 'black');
            $('#container').css({'background-color': 'rgb(141, 217, 103)', 'border': '1vw solid rgb(78, 181, 26)'});
            $('#info').css('background-color', 'rgb(78, 181, 26)');
            $('#results').css('background-color', 'rgb(78, 181, 26)');
            $('.modal-content').css('background-color', 'rgb(141, 217, 103)');
            $('th').css('background-color', 'rgb(78, 181, 26)');
            returnColor = "rgb(141, 217, 103)"
        }
        if(theme === "red"){
            $('body').css('color', 'white');
            $('#container').css({'background-color': 'rgb(202, 28, 28)', 'border': '1vw solid rgb(151, 13, 13)'});
            $('#info').css('background-color', 'rgb(151, 13, 13)');
            $('#results').css('background-color', 'rgb(151, 13, 13)');
            $('.modal-content').css('background-color', 'rgb(202, 28, 28)');
            $('th').css('background-color', 'rgb(151, 13, 13)');
            returnColor = "rgb(202, 28, 28)"
        }

    }
}

let typer = new Typer();




