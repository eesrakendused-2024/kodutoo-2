const modal = document.getElementById("resultsModal");
const showResultsBtn = document.getElementById("showResults");
const closeSpan = document.querySelector(".modal .close");

showResultsBtn.onclick = function () {
    displayResults();
    modal.style.display = "block";
};

closeSpan.onclick = function () {
    modal.style.display = "none";
};

window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

function displayResults() {
    const resultsTable = document.getElementById("resultsTable");
    const scoreDiv = document.getElementById("score");

    resultsTable.innerHTML = "";
    scoreDiv.innerHTML = "";

    for (let i = 0; i < typer.results.length && i < 10; i++) {
        const result = typer.results[i];
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = result.name;
        row.appendChild(nameCell);
        
        const timeCell = document.createElement("td");
        timeCell.textContent = `${result.time} sekundit`;
        row.appendChild(timeCell);
        
        const wordsCell = document.createElement("td");
        wordsCell.textContent = result.words;
        row.appendChild(wordsCell);
        
        const charsCell = document.createElement("td");
        charsCell.textContent = result.chars;
        row.appendChild(charsCell);
        
        const wpmCell = document.createElement("td");
        wpmCell.textContent = result.wordsPerMin;
        row.appendChild(wpmCell);

        resultsTable.appendChild(row);
    }

    if (typer.results.length > 0) {
        const lastResult = typer.results[typer.results.length - 1];
        const wpm = parseFloat(lastResult.wordsPerMin);

        scoreDiv.innerHTML = `Sinu kiirus (sõnu minutis): ${wpm}<br>`;

        let imageUrl;
        if (wpm >= 80) {
            imageUrl = "competitive_speed.jpg";
        } else if (wpm >= 70) {
            imageUrl = "high_speed.png";
        } else if (wpm >= 60) {
            imageUrl = "productive_speed.png";
        } else if (wpm >= 50) {
            imageUrl = "above_average_speed.jpg";
        } else {
            imageUrl = "average_speed.png";
        }

        const img = document.createElement("img");
        img.src = imageUrl;
        img.alt = "Typing Speed";
        img.className = "score-image";
        scoreDiv.appendChild(img);
    }
}



const typingSound = new Audio('Typewriter(chosic.com).mp3');

function stopSound() {
    typingSound.pause();
    typingSound.currentTime = 0;
}

class Typer{
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

        console.log(this.words)

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
        this.startTime = performance.now();
        console.log(this.startingWordLength);
    }

    updateInfo(){
        $('#gameinfo').html((this.wordsTyped + 1) + ". sõna " + this.wordsInGame + "-st");
    }

    shortenWord(keypressed){
        if(this.word.charAt(0) != keypressed){
            document.getElementById('container').style.backgroundColor = "lightpink";
            setTimeout(function(){
                document.getElementById('container').style.backgroundColor = "beige";
            }, 100);
        }

        if(this.word.length > 1 && this.word.charAt(0) == keypressed){
            this.word = this.word.slice(1);
            this.drawWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped != this.wordsInGame - 1){
            this.wordsTyped++;
            this.selectWord();
            typingSound.play();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped == this.wordsInGame - 1){
            this.endTime = performance.now();
            this.word = this.word.slice(1);
            this.drawWord();
            $('#score').html(this.name + ", sinu aeg oli: " + ((this.endTime-this.startTime)/1000).toFixed(2) + " sekundit.");
            this.saveResults();
            $('#restart, #score').show();
            stopSound();
        }
    }

    generateWords(){
        for(let i = 0; i < this.wordsInGame; i++){
            const wordLength = this.startingWordLength + i;
            const randomWord = Math.round(Math.random() * 
            this.words[wordLength].length);
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
        
        let wordsTyped = this.wordsInGame;
        let timeInMinutes = (this.endTime - this.startTime) / 1000 / 60;
        let wordsPerMinute = (wordsTyped / timeInMinutes).toFixed(2);

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
        for(let i = 0; i < this.results.length; i++){
            if(i === 10){break;}
            $("#results").append((i+1) + "." + this.results[i].name + "    " + this.results[i].time +
            "    " + this.results[i].words + "    " + this.results[i].chars + "    " + this.results[i].wordsPerMin + "<br>");
        }
    }

    
}

let typer = new Typer();

