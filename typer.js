//let playerName = prompt('Palun sisesta oma nimi')

class Typer{
    constructor(){
        this.name = "Anonüümne"; //kasutaja nimi, mida ta peab mängu alguses sisestam
        this.wordsInGame = 5; //mitu sõna peab trükkima, et mäng lõppeks
        this.wordsTyped = 0; //mitu sõna on trükitud
        this.startingWordLength = 3; //esimese sõna pikkus
        this.words = []; //need sõnad, mis tulevad lemmade failist
        this.typeWords = []; //need sõnad, mida hakkame trükkima
        this.word = "aabits"; //sõna, mida peab trükkima
        this.startTime = 0; //mängu algusaeg
        this.endTime = 0; // mängu lõpuaeg
        this.results = [];
        this.chars = 0;
        this.attempts = 0;

        this.loadFromFile();

        this.setupModal();

        $(document).ready(() => $('#nameValue').focus());
    }

    setupModal() {
        // When the document is ready
        $(document).ready(() => {
            // When the open modal button is clicked
            $("#openModalBtn").click(() => {
                // Show the modal
                $("#myModal").css("display", "block");
            });

            // When the user clicks on <span> (x), close the modal
            $(".close").click(() => {
                // Hide the modal
                $("#myModal").css("display", "none");
            });

            // When the user clicks anywhere outside of the modal, close it
            $(window).click((event) => {
                if (event.target == $("#myModal")[0]) {
                    $("#myModal").css("display", "none");
                }
            });
        });
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
        const dataFromFile = data.split('\r\n');
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
        $('#restart, #score').hide();
        this.wordsTyped = 0;
        this.generateWords();
        this.attempts += 1;
        this.updateInfo();
        this.startTime = performance.now();
        console.log(this.startingWordLength);
    }

    updateInfo(){
        $('#gameinfo').html((this.wordsTyped + 1) + ". sõna " + this.wordsInGame + "-st</p><p>" + (this.attempts) + ". katse");
    }

    shortenWord(keypressed){
        //console.log(keypressed);

        if(this.word.charAt(0) != keypressed){
            document.getElementById('container').style.backgroundColor = "rgba(144, 0, 0,1)";
            setTimeout(function(){
                document.getElementById('container').style.backgroundColor = "rgba(0,0,0,0.5)";
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
            if (this.name != "" && this.name != "Anonüümne") {
                $('#score').html(this.name + ", sinu aeg oli: " + ((this.endTime-this.startTime)/1000).toFixed(2) + " sekundit.");
            } else {
                $('#score').html("Sinu aeg oli: " + ((this.endTime-this.startTime)/1000).toFixed(2) + " sekundit.");
                this.name = "Anonymous";
            }
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

        this.showResults();

        if(wordsPerMinute >= 300){
            setTimeout(() => {
                this.showImageModal('images/godlike.png', "GODLIKE");
            }, 10);
        } else if(wordsPerMinute < 300 && wordsPerMinute >= 250){
            setTimeout(() => {
                this.showImageModal('images/genius.jpg', "Genius!");
            }, 10);
        } else if(wordsPerMinute < 250 && wordsPerMinute >= 200){
            setTimeout(() => {
                this.showImageModal('images/pro.jpg', "Pro!");
            }, 10);
        } else if(wordsPerMinute < 200 && wordsPerMinute >= 150){
            setTimeout(() => {
                this.showImageModal('images/aaverage.jpg', "Above average!");
            }, 10);
        } else if (wordsPerMinute < 150 && wordsPerMinute >= 50){
            setTimeout(() => {
                this.showImageModal('images/average.jpg', "Average.");
            }, 10);
        } else {
            setTimeout(() => {
                this.showImageModal('images/noob.jpg', "Try again...");
            }, 10);
        }

        

        $.post('server.php', {save: this.results}).done(
            function(){
                console.log("Success");
            }
        );
    }

    showImageModal(imageSrc, text) {
        $('#modalImage').attr('src', imageSrc);
        $('#level').html(text);
        $('#imageModal').show();

        $('.close2').click(() => {
            $('#imageModal').hide();
        });

        $(window).click((event) => {
            if (event.target.id === 'imageModal') {
                $('#imageModal').hide();
            }
        });
    }

    showResults(){
        /* $('#results').html("");
        for(let i = 0; i < this.results.length; i++){
            if(i === 10){break;}
            $("#results").append((i+1) + ". " + this.results[i].name + " " + this.results[i].time +
            " " + this.results[i].words + " " + this.results[i].chars + " " + this.results[i].wordsPerMin + "<br>");
        } */

        $('#results').html("");
        const table = $('<table>').addClass('results-table');
        const headerRow = $('<tr>').appendTo(table);
        $('<th>').text('Positsioon').appendTo(headerRow);
        $('<th>').text('Nimi').appendTo(headerRow);
        $('<th>').text('Tähed minuti kohta').appendTo(headerRow);
        $('<th>').text('Aeg').appendTo(headerRow);
        $('<th>').text('Sõnad').appendTo(headerRow);
        $('<th>').text('Tähed').appendTo(headerRow);

        for (let i = 0; i < this.results.length; i++) {
            if (i === 10) {break;}
            const result = this.results[i];
            const row = $('<tr>').appendTo(table);
            $('<td>').text(i + 1).appendTo(row);
            $('<td>').text(result.name).appendTo(row);
            $('<td>').text(result.wordsPerMin).appendTo(row);
            $('<td>').text(result.time).appendTo(row);
            $('<td>').text(result.words).appendTo(row);
            $('<td>').text(result.chars).appendTo(row);
        }
        
        table.appendTo('#results');
    }
}

let typer = new Typer();