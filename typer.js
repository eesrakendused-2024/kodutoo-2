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
        this.streak = 1; //streak

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
        this.showResults();
    }

    startTyper(){
        this.streak = 0;
        $('#restart, #score').hide();
        $("#streak").show();
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
        this.chars = 0;
        for(let i = 0; i < this.wordsInGame; i++){
            this.chars = this.chars + this.startingWordLength + i;
            console.log(this.chars);
        }

        if(this.word.charAt(0) != keypressed){
            document.getElementById('container').style.backgroundColor = "rgba(236, 130, 130, 0.505)";
            setTimeout(function(){
                document.getElementById('container').style.backgroundColor = "transparent";
            }, 100);
            this.resetStreak();
        }

        if(this.word.length > 1 && this.word.charAt(0) == keypressed){
            this.word = this.word.slice(1);
            this.updateStreak();
            this.drawWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped != this.wordsInGame - 1){
            this.wordsTyped++;
            this.updateStreak();
            this.selectWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped == this.wordsInGame - 1){
            this.endTime = performance.now();
            this.word = this.word.slice(1);
            this.drawWord();
            let wpmpic = "";
            let wordsPerMin = ((this.chars / ((this.endTime - this.startTime) / 1000)) * 60).toFixed(0);
            console.log("wordsPerMin "+wordsPerMin);
            if (wordsPerMin >= 40 && wordsPerMin <= 49) {
                wpmpic = "type_avarage.png";
            } else if (wordsPerMin >= 50 && wordsPerMin <= 59) {
                wpmpic = "type_above.png";
            } else if (wordsPerMin >= 60 && wordsPerMin <= 69) {
                wpmpic = "type_productive.png";
            } else if (wordsPerMin >= 70 && wordsPerMin <= 120) {
                wpmpic = "type_high.png";
            } else if (wordsPerMin > 120) {
                wpmpic = "type_comp.png";
            } else {
                wpmpic = "type_bad.png";
            }
            let htmlContent = this.name + ", sinu aeg oli: " + (((this.endTime - this.startTime) / 1000)/60).toFixed(2) + " minutit. Sinu streak oli "+ this.streak;
            htmlContent += '<br><img src="' + wpmpic + '" alt="typing image">';
            $('#score').html(htmlContent);

            this.saveResults();
            
            $("#streak").hide();
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
        //console.log("wordsPerMinute "+wordsPerMinute);


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
        $('#results').html(""); // Clear the previous results
        const table = $('<table>').addClass('center'); // Create a new table element with the 'center' class
        const headerRow = $('<tr>'); // Create a header row
    
        // Add table headers
        headerRow.append($('<th>').text('Koht'));
        headerRow.append($('<th>').text('Nimi'));
        headerRow.append($('<th>').text('Aeg'));
        headerRow.append($('<th>').text('Sõnade arv'));
        headerRow.append($('<th>').text('Tähtede arv'));
        headerRow.append($('<th>').text('Sõnu minutis'));
    
        table.append(headerRow); // Append the header row to the table
    
        // Iterate over results and create table rows
        for(let i = 0; i < this.results.length; i++){
            if(i === 10) break; // Show only the top 10 results
            const result = this.results[i]; // Get the current result object
            const row = $('<tr>'); // Create a new table row
    
            // Add data to the row
            row.append($('<td>').text(i + 1));
            row.append($('<td>').text(result.name));
            row.append($('<td>').text(result.time));
            row.append($('<td>').text(result.words));
            row.append($('<td>').text(result.chars));
            row.append($('<td>').text(result.wordsPerMin));
    
            table.append(row); // Append the row to the table
        }
    
        $('#results').append(table); // Append the table to the results div
    }
    updateStreak() {
        this.streak++;
        if (this.streak > this.maxStreak) {
            this.maxStreak = this.streak;
        }
        $("#streak").html(this.streak);
    }

    resetStreak() {
        this.streak = 0;
        $("#streak").html(this.streak);
    }

}

let typer = new Typer();

