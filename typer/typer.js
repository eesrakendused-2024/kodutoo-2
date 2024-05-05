class Typer {
    constructor(){
        this.name = "Anonüümne";
        this.wordsInGame = 3;
        this.wordsTyped = 0;
        this.startingWordLength = 3;
        this.words = [];
        this.typeWords = [];
        this.word = "aabits";
        this.startTime = 0;
        this.endTime = 0;
        this.results = [];
        this.chars = 0;
        this.errors = 0;
        this.errorLimit = 6; 
        this.gifs = {
            "slow": "images/slow.gif",
            "average": "images/average.gif",
            "fast": "images/fast.gif"

        };

        $('.speed-gif').remove();


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
        $('#restart, #score').hide();
        this.wordsTyped = 0;
        this.generateWords();
        this.updateInfo();
        this.errors = 0;
        this.startTime = performance.now();
        console.log(this.startingWordLength);
    }

    endGame(){
        alert('Mäng läbi! Tegite 6 viga.');
        $('#restart').show();
    }

    updateInfo(){
        $('#gameinfo').html((this.wordsTyped + 1) + ". sõna " + this.wordsInGame + "-st");
    }
    

    shortenWord(keypressed) {
        const wordDiv = document.getElementById('wordDiv');
    
        $('.speed-gif').remove();
    
        if (this.word.charAt(0) != keypressed) {
            this.errors++;
            wordDiv.style.color = "lightpink";
            setTimeout(() => {
                wordDiv.style.color = "";
            }, 100);
    
            if (this.errors >= this.errorLimit) {
                this.endGame();
                return;
            }
        }
    
        if (this.word.charAt(0) != keypressed) {
            wordDiv.style.color = "lightpink";
            setTimeout(function () {
                wordDiv.style.color = "";
            }, 100);
        }
    
        if (this.word.length > 1 && this.word.charAt(0) == keypressed) {
            this.word = this.word.slice(1);
            this.chars++; 
            this.drawWord();
        } else if (this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped != this.wordsInGame - 1) {
            this.wordsTyped++;
            this.chars++; 
            this.selectWord();
        } else if (this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped == this.wordsInGame - 1) {
            this.endTime = performance.now();
            this.word = this.word.slice(1);
            this.chars++; 
            this.drawWord();
            $('#score').html(this.name + ", sinu aeg oli: " + ((this.endTime - this.startTime) / 1000).toFixed(2) + " sekundit.");
    
            const speedTier = this.calculateSpeedTier(((this.chars / ((this.endTime - this.startTime) / 1000)) * 60).toFixed(0));
            const gifSrc = this.gifs[speedTier];
            const gifElement = document.createElement('img');
            gifElement.src = gifSrc;
            gifElement.classList.add('speed-gif');
            document.body.appendChild(gifElement);
    
            $('#score').after(gifElement);
    
            this.saveResults();
            $('#restart, #score').show();
        }
    }
    
    
    

    generateWords(){
        for(let i = 0; i < this.wordsInGame; i++){
            const wordLength = this.startingWordLength + i;
            const randomWord = Math.round(Math.random() * this.words[wordLength].length);
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
    
        const totalTimeSeconds = (this.endTime - this.startTime) / 1000;
        const wpm = Math.round((this.chars / 5 / totalTimeSeconds) * 60);
        console.log("Words per minute:", wpm);
        
        let result = {
            name: this.name,
            time: ((this.endTime-this.startTime)/1000).toFixed(2),
            words: this.wordsInGame,
            chars: this.chars,
            wordsPerMin: wpm
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
    

    calculateSpeedTier(wordsPerMin) {
        if (wordsPerMin < 30) {
            return "slow";
        } else if (wordsPerMin >= 30 && wordsPerMin < 50) {
            return "average";
        } else {
            return "fast";
        }
    }
    

    showResults(){
        $('#results').html("");
        for(let i = 0; i < this.results.length; i++){
            if(i === 10){break;}
            $("#results").append((i+1) + "." + this.results[i].name + " " + this.results[i].time +
            " " + this.results[i].words + " " + this.results[i].chars + " " + this.results[i].wordsPerMin + "<br>");
        }
    }

    showResultsModal() {
        const modal = document.getElementById("resultsModal");
        const modalContent = modal.querySelector(".modal-content");
        const resultsTable = modalContent.querySelector("#resultsTable");
    
        this.results.sort((a, b) => b.wordsPerMin - a.wordsPerMin);
    
        resultsTable.innerHTML = "";
    
        const headerRow = "<tr><th>Nimi</th><th>Aeg</th><th>Sõnu</th><th>Tähti</th><th>Tähti minutis</th></tr>";
        resultsTable.innerHTML += headerRow;
    
        for(let i = 0; i < this.results.length; i++){
            if(i === 10){ break; }
            const result = this.results[i];
            const row = `<tr><td>${result.name}</td><td>${result.time}</td><td>${result.words}</td><td>${result.chars}</td><td>${result.wordsPerMin}</td></tr>`;
            resultsTable.innerHTML += row;
        }
    
        modal.style.display = "block";
    }   
}

let typer = new Typer();

var modal = document.getElementById("resultsModal");

var btn = document.getElementById("showResults");

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

document.getElementById("showResults").addEventListener("click", () => {
    typer.showResultsModal();
});
