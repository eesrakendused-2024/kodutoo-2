//let playerName = prompt('Palun sisesta oma nimi')

class Typer{
    constructor(){
        this.name = "Anonüümne"; //kasutaja nimi, mida ta peab mÃ¤ngu alguses sisestam
        this.wordsInGame = 3; //mitu sÃµna peab trÃ¼kkima, et mÃ¤ng lÃµppeks
        this.wordsTyped = 0; //mitu sÃµna on trÃ¼kitud
        this.startingWordLength = 3; //esimese sÃµna pikkus
        this.words = []; //need sÃµnad, mis tulevad lemmade failist
        this.typeWords = []; //need sÃµnad, mida hakkame trÃ¼kkima
        this.word = "aabits"; //sÃµna, mida peab trÃ¼kkima
        this.startTime = 0; //mÃ¤ngu algusaeg
        this.endTime = 0; // mÃ¤ngu lÃµpuaeg
        this.results = [];
        this.chars = 0;
        
        this.preloadKeyPressSound();

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

        //console.log(this.words);
        $('#submitName').click(
            ()=>{
                this.name = $('#nameValue').val();
                this.startingWordLength = parseFloat($('#startingWordLength').val());
                this.wordsInGame = parseFloat($('#wordsInGame').val());

                if(this.startingWordLength + this.wordsInGame > 31){
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
        $(document).on("keypress", (event) => {
            this.shortenWord(event.key);
            this.playKeyPressSound(); // Call the method to play the sound
        });
        $('#restart').on('click', () => this.startTyper());
        this.showResults();
    }

    startTyper(){
        $('#restart, #score, #modal-btn').hide();
        this.wordsTyped = 0;
        this.generateWords();
        this.updateInfo();
        this.startTime = performance.now();
        console.log(this.startingWordLength);
    }

    updateInfo(){
        $('#gameinfo').html((this.wordsTyped + 1) + " /  " + this.wordsInGame);
    }

    shortenWord(keypressed){
        //console.log(keypressed);

        if(this.word.charAt(0) != keypressed) {
            document.getElementById('container').style.backgroundColor = "red";
            setTimeout(function() {
                document.getElementById('container').style.backgroundColor = "lavender";
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
            $('#restart, #score, #modal-btn').show();
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
        for(let i = 0; i < this.wordsInGame; i++) {
            this.chars =  this.chars + this.startingWordLength + i;
            console.log(this.chars);
        }

        let wordsPerMinute = ((this.chars/((this.endTime-this.startTime)/1000)) * 60).toFixed(0);
        console.log("Sõnu minutis " + wordsPerMinute);

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

    showResults() {
        let table = "<table>";
        table += "<tr><th>#</th><th>Nimi</th><th>Aeg(sek)</th><th>Sõnu</th><th>Tähti</th><th>Sõnu/Min</th></tr>";
        
        for (let i = 0; i < this.results.length; i++) {
            if (i === 10) { break; }
            table += "<tr>";
            table += "<td>" + (i + 1) + "</td>";
            table += "<td>" + this.results[i].name + "</td>";
            table += "<td>" + this.results[i].time + "</td>";
            table += "<td>" + this.results[i].words + "</td>";
            table += "<td>" + this.results[i].chars + "</td>";
            table += "<td>" + this.results[i].wordsPerMin + "</td>";
            table += "<td>" + this.getSpeedImage(this.results[i].wordsPerMin) + "</td>";
            table += "</tr>";
        }
    
        table += "</table>";
    
        $('#results').html(table);
    }

    getSpeedImage(speed) {
        let imageSize = "width: 50px; height: auto;"; // Adjust the size as needed
    
        if (speed >= 120) {
            return "<img src='images/competitive_speed.png' alt='competitive_speed' style='" + imageSize + "'>";
        } else if (speed >= 70) {
            return "<img src='images/high_speed' alt='high_speed' style='" + imageSize + "'>";
        } else if (speed >= 60) {
            return "<img src='images/productive_speed' alt='productive_speed' style='" + imageSize + "'>";
        } else if (speed >= 50) {
            return "<img src='images/above_average.png' alt='above_average' style='" + imageSize + "'>";
        } else if (speed >= 40) {
            return "<img src='images/average.png' alt='average' style='" + imageSize + "'>";
        } else {
            return "<img src='images/tigu.png' alt='tigu' style='" + imageSize + "'>";
        }
        
    }

    preloadKeyPressSound() {
        const keySound = document.getElementById('keySound');
        keySound.load(); // Preload the audio file
    }


    playKeyPressSound() {
        const keySound = document.getElementById('keySound');
        keySound.currentTime = 0;
        keySound.play();
    }

    initModal() {
        // Get the modal
        let modal = document.getElementById("modal-container");

        // Get the button that opens the modal
        let btn = document.getElementById("modal-btn");

        // Get the <span> element that closes the modal
        let span = document.getElementsByClassName("close")[0];

        // When the user clicks on the button, open the modal
        btn.onclick = function() {
            modal.style.display = "block";
        };

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        };

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };
    }
}

let typer = new Typer();
typer.initModal();