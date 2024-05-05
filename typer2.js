//let playerName = prompt('Palun sisesta oma nimi')

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
        $.get("lemmad.txt", (data) => this.getWords(data));
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
        this.showResults();
    }

    startTyper(){
        $('#restart, #score, #wpmGrade').hide();
        $('#info').show();
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
            document.getElementById('background').style.backgroundColor = "lightpink";
            setTimeout(function(){
                document.getElementById('background').style.backgroundColor = "cadetblue";
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
            $('#restart, #score, #wpmGrade').show();
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
        //Tean, et ütlesite, et peaks kuvama pilti, aga sellelt lehelt ma ei leidnud, midagi mida peaks pildina näitama. Seega ma panin tektsina, et mälu ja resurrsse kokku hoida.
        let wpmMeasure = ((this.chars/((this.endTime-this.startTime)/1000)) * 60);
        let wordsPerMinute = ((this.chars/((this.endTime-this.startTime)/1000)) * 60).toFixed(0);
        console.log(wpmMeasure);
        wpmMeasure = 61;
        if (wpmMeasure > 120){
            console.log("Competitive speed");
            $('#wpmGrade').html("Competitive speed")
        } else if (wpmMeasure > 70){
            console.log("Competitive speed");
            $('#wpmGrade').html("High speed")
        } else if (wpmMeasure > 60){
            console.log("Competitive speed");
            $('#wpmGrade').html("Productive speed")
        } else if (wpmMeasure > 50){
            console.log("Above average speed");
            $('#wpmGrade').html("Above average speed")
        } else if (wpmMeasure > 40){
            console.log("Average speed");
            $('#wpmGrade').html("Average speed")
        }

        let result = {
            name: this.name,
            time: ((this.endTime-this.startTime)/1000).toFixed(2),
            words: this.wordsInGame,
            chars: this.chars,
            wordsPerMin: wordsPerMinute
        }

        this.results.push(result);

        this.results.sort((a, b) => parseFloat(b.wordsPerMin) - parseFloat(a.wordsPerMin));

        this.showResults();

        $.post('server.php', {save: this.results}).done(
            function(){
                console.log("Success");
            }
        );
    }

    showResults(){
        $('#results').html("");
        $("#results").append('<p>Name; Time; Words; Chars; WPM;</p>');
        for(let i = 0; i < this.results.length; i++){
            if(i === 10){break;}
            $("#results").append((i+1) + ". " + this.results[i].name + " | " + this.results[i].time +
            " | " + this.results[i].words + " | " + this.results[i].chars + " | " + this.results[i].wordsPerMin + " |<br>");
        }
    }
    
}
let typer = new Typer();
//Fondi vahetus
//GPT aitas välja mõelda lahenduse, kus saab ühe funktsiooniga, kui oleks ise teind oleksin iga fondi jaoks funktsiooni teind eventListeneriga ja ID'dega. Unustasin, et buttonile saab määrata OnClick :P
function changeFont(fontFamily){
    document.body.style.fontFamily = fontFamily;
}

// Game results modal
var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
  modal.style.display = "block";
}
span.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}