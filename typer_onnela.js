//let playerName = prompt('Palun sisesta oma nimi');

class Typer{
    constructor(){
        this.name = "Anonüümne"; //kasutaja nimi, mita ta peab mängu alguses sisestama
        this.wordsInGame = 3; //mitu sõnakest peab trükkima, et mäng lõppeks
        this.wordsTyped = 0; //mitu sõna on trükitud
        this.startingWordLength = 3; //esimese sõna pikkus
        this.words = []; //need sõnad, mis tulevad lemmade failist
        this.typeWords = []; //need sõnad, mida hakkame trükkima
        this.word = "aabits"; //sõna mida peab trükkima
        this.startTime = 0; //mängu algusaeg
        this.endTime = 0; //mängu lõpuaeg
        this.results = [];
        this.chars = 0;

        this.loadFromFile();
    }

    loadFromFile(){
        $.get("lemmad2013.txt", (data)=> this.getWords(data));

        $.get("database.txt", (data)=>{
            let content = JSON.parse(data).content;
            this.results = content;
            //console.log(this.results);
        });
    }

    getWords(data){
        //console.log(data);
        const dataFromFile = data.split('\n');
        this.separateWordsByLength(dataFromFile);
    }

    separateWordsByLength(data){
        for(let i = 0; i < data.length; i++){
            //this.words = [["a"], ["as"]]
            const wordLength = data[i].length;

            if(this.words[wordLength] === undefined){
                this.words[wordLength] = [];
            }

            this.words[wordLength].push(data[i]);
        }

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
                }

                this.startTyper();
                this.startOnce();
            }
        )
    }
    
    startOnce(){
        $(document).on("keypress", (event)=> this.shortenWord(event.key));
        $('#restart').on('click', ()=>this.startTyper());
        this.showResults();
    }

    startTyper(){
        $('#restart, #score').hide(); //sellega peidame restart buttoni
        this.wordsTyped = 0;
        this.generateWords();
        this.updateInfo();
        this.wordsTyped = 0;
        this.startTime = performance.now();
    }

    updateInfo(){
        $('#gameinfo').html((this.wordsTyped +1) + ". sõna" + " " + this.wordsInGame + "-st");
    }

    shortenWord(keypressed){
        //console.log(keypressed);

        if(this.word.charAt(0) != keypressed){
            document.getElementById('container').style.backgroundColor = "red"; //kui vajutad valet tähte
            setTimeout(function(){
                document.getElementById('container').style.backgroundColor = "lightpink";
            }, 100);
        }

        if(this.word.length > 1 && this.word.charAt(0) == keypressed){
            this.word = this.word.slice(1);
            this.drawWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped != this.wordsInGame - 1){
            this.wordsTyped++; //tahame ühe võrra suurendada kui sõna trükitud
            this.selectWord(); //valitakse uus järgmine sõna
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped == this.wordsInGame - 1){
            this.endTime = performance.now();
            this.word = this.word.slice(1);
            this.drawWord();
            $('#score').html(this.name + ", sinu aeg oli: " + ((this.endTime-this.startTime)/1000).toFixed(2) + " sekundit.");
            this.saveResults();
            //$(document).off("keypress");
            $('#restart, #score').show(); //toome peidetud nupu välja
        }
    }



    generateWords(){
        for(let i = 0; i < this.wordsInGame; i++){
            const wordLength = this.startingWordLength + i;
            const randomWord = Math.round(Math.random() * this.words[wordLength].length);
            console.log(wordLength, randomWord);

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
        $('#wordDiv').html(this.word); //dollari märk on jquery
        this.updateInfo();
    }

    saveResults(){
        this.chars = 0;
        let char = 0;
        for(let i = 0; i < this.wordsInGame; i++){
            this.chars = this.chars + this.startingWordLength + i; 
        }

        let wordsPerMinute = ((this.chars/((this.endTime-this.startTime)/1000)) * 60).toFixed(0);
        console.log(wordsPerMinute)

        let result = {
            name: this.name, //objekti sees on koma
            time: ((this.endTime-this.startTime)/1000).toFixed(2),
            words: this.wordsInGame,
            chars: this.chars,
            wordsPerMin: wordsPerMinute
        }

        this.results.push(result);

        this.results.sort((a, b) => parseFloat(b.wordsPerMin) - parseFloat(a.time));

        this.showResults();

        $.post('server.php', {save: this.results}).done(
            function() {
                console.log("Success");
            }
        );
    }

    showResults(){
        $('#results').html("");
        for(let i = 0; i < this.results.length; i++){
            if(i === 10){break} //3 võrdusmärki kasutame siis kui kontrollime numbrit ja tüüpi
            $("#results").append((i+1) + "." + " " + this.results[i].name + ", sinu aeg oli: " + this.results[i].time + 
            "s " + "<br>" + "Sõnade arv: " + this.results[i].words + ", sõnu minutis: " + this.results[i].wordsPerMin + "<br>");
        }
    }
}

let typer = new Typer();
