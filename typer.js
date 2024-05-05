
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
        this.images = { 
            "noexperience": "images/noexperience.jpg",
            "beginner": "images/beginner.jpg",
            "intermediate": "images/intermediate.jpg",
            "expert": "images/expert.gif"
        };
        this.timer = 0;
        this.timerInterval = null;

        this.loadFromFile();
    }

    loadFromFile(){
        $.get("txtfiles/lemmad2013.txt", (data) => this.getWords(data));

        $.get("txtfiles/database.txt", (data)=>{
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
        $(document).on("keypress", (event)=>
            this.shortenWord(event.key));
        $('#restart').on('click', ()=>this.startTyper());
        this.showResults();
        
    }

    startTyper(){
        $('#restart, #score, .big-img').hide();
        this.wordsTyped = 0;
        this.generateWords();
        this.updateInfo();
        this.startTime = performance.now();
        this.timerInterval = setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);
        

    }

    updateInfo(){
        $('#gameinfo').html("Sõnu: " + (this.wordsTyped) + "/" + this.wordsInGame)
    }

    updateTimerDisplay(){
        const elapsedTime = Math.floor((performance.now() - this.startTime) / 1000);

        $('#timer').text("Aeg: " + elapsedTime + " sekundit");
        if (this.wordsTyped === this.wordsInGame) {
            this.endTime = performance.now();
            clearInterval(this.timerInterval);
            $('#timer').text(" ");
        }
    }

    shortenWord(keypressed){

        if(this.word.charAt(0) != keypressed){
            document.getElementById('container').style.backgroundColor = "red";
            setTimeout(function(){
                document.getElementById('container').style.backgroundColor = 
                "rgba(255, 255, 255, 0.45)";
            }, 100);
        }

        if(this.word.length > 1 && this.word.charAt(0) == keypressed){

            this.word = this.word.slice(1);
            this.drawWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && 
        this.wordsTyped != this.wordsInGame - 1){
            this.wordsTyped++;
            this.selectWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && 
        this.wordsTyped == this.wordsInGame - 1){
            this.wordsTyped++;
            this.endTime = performance.now();
            $('#timer').html(" ");
            this.word = this.word.slice(1);
            this.drawWord();
            $('#score').html(this.name + ", sinu aeg oli: " + ((this.endTime-
                this.startTime)/1000).toFixed(2) + " sekundit.");
            this.saveResults();
            $('#restart, #score').show();

            let wordsPerMinute = ((this.chars / ((this.endTime - this.startTime) 
            / 1000)) * 60).toFixed(0);

            let imageName;
            if (wordsPerMinute < 45) {
              imageName = "noexperience";
            } else if (wordsPerMinute >= 45 && wordsPerMinute < 65) {
              imageName = "beginner";
            } else if (wordsPerMinute >= 65 && wordsPerMinute < 95){
              imageName = "intermediate";
            } else {
                imageName = "expert";
            }
      
            $('.big-img').attr('src', this.images[imageName]);
            $('.big-img').show();
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

        let wordsPerMinute = ((this.chars/((this.endTime-this.startTime)/1000))
        * 60).toFixed(0);

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
        let table = '<table class="results-table">';
        table += "<tr><th>Koht</th><th>Nimi</th><th>Aeg(s)</th><th>Sõnade arv</th>" + 
        "<th>Tähtede arv</th><th>Kiirus (sõnu/min)</th><th>    </th></tr>";
        for(let i = 0; i < this.results.length; i++){
            if(i === 10){break;}
            let emoji;
            if (this.results[i].wordsPerMin < 45) {
                emoji = "images/tier_4.png";
            } else if (this.results[i].wordsPerMin >= 45 && this.results[i].wordsPerMin < 65) {
                emoji = "images/tier_3.png";
            } else if (this.results[i].wordsPerMin >= 65 && this.results[i].wordsPerMin < 95){
                emoji = "images/tier_2.png";
            } else {
                emoji = "images/tier_1.png";
            }
            let row = "<tr><td>" + (i+1) + "</td>";
            row += "<td>" + this.results[i].name + "</td>";
            row += "<td>" + this.results[i].time + "</td>";
            row += "<td>" + this.results[i].words + "</td>";
            row += "<td>" + this.results[i].chars + "</td>";
            row += "<td>" + this.results[i].wordsPerMin + "</td>";
            row += '<td><img src="' + emoji + '" alt="Speed Emoji" class="emoji-icon"></td></tr>';
    
            table += row;
        }
        table += "</table>";
        $("#results").html(table);
    }
}

let typer = new Typer();