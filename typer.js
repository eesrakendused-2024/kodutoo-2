class Typer {
    constructor() {
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

    loadFromFile() {
        $.get("lemmad2013.txt", (data) => this.getWords(data));

        $.get("database.txt", (data) => {
            let content = JSON.parse(data).content;
            this.results = content;
            console.log(this.results);
        })
    }

    getWords(data) {
        const dataFromFile = data.split('\n');
        this.separateWordsByLength(dataFromFile);
    }

    separateWordsByLength(data) {
        for (let i = 0; i < data.length; i++) {
            const wordLength = data[i].length;

            if (this.words[wordLength] === undefined) {
                this.words[wordLength] = [];
            }

            this.words[wordLength].push(data[i]);
        }

        $('#submitName').click(() => {
            this.name = $('#nameValue').val();
            this.startingWordLength = parseFloat($('#startingWordLength').val());
            this.wordsInGame = parseFloat($('#wordsInGame').val());
            if (this.startingWordLength + this.wordsInGame > 31) {
                $('#error').show();
            } else {
                $('#name').hide();

                this.startTyper();
                this.startOnce();
            }
        });
    }

    startOnce() {
        $(document).on("keypress", (event) => this.shortenWord(event.key));
        $('#restart').on('click', () => this.startTyper());
        $('#resultButton').on('click', () => $("#myModal").css("display", "block"));
        $('.close').on('click', function() {$("#myModal").css("display", "none");});
        this.updateResults();

        $(document).ready(function() {
            $('#fontSelect').change(function() {
                var selectedFont = $('#fontSelect').val();
                $('body').css('font-family', selectedFont);
            });
        });
    }

    startTyper() {
        $('#restart, #score').hide();
        $('#nextWordDiv').show();
        $('#container').removeClass();
        this.wordsTyped = 0;
        this.generateWords();
        this.updateInfo();
        this.startTime = performance.now();
        console.log(this.startingWordLength);
    }

    updateInfo() {
        $('#gameinfo').html((this.wordsTyped + 1) + ". sõna " + this.wordsInGame + "-st");
    }

    shortenWord(keypressed) {
        if (this.word.charAt(0) != keypressed) {
            document.getElementById('container').style.backgroundColor = "lightpink";
            setTimeout(function () {
                document.getElementById('container').style.backgroundColor = "yellow";
            }, 100);
        }

        if (this.word.length > 1 && this.word.charAt(0) == keypressed) {
            this.word = this.word.slice(1);
            this.drawWord();
        } else if (this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped != this.wordsInGame - 1) {
            this.wordsTyped++;
            this.selectWord();
        } else if (this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped == this.wordsInGame - 1) {
            this.endTime = performance.now();
            this.word = this.word.slice(1);
            this.drawWord();
                $('#nextWordDiv').hide();
            $('#score').html(this.name + ", sinu aeg oli: " + ((this.endTime - this.startTime) / 1000).toFixed(2) + " sekundit.");
            this.saveResults();
                let charPerMin = ((this.chars / ((this.endTime - this.startTime) / 1000)) * 60).toFixed(0)
                    if (charPerMin < 160){
			        	$('#container').addClass('background-slow');
			        }
			        else if (charPerMin < 200){
			    	    $('#container').addClass('background-average');
			        }
			        else if (charPerMin < 250){
			    	    $('#container').addClass('background-fast');
                    }
            $('#restart, #score').show();
        }
    }

    generateWords() {
        for (let i = 0; i < this.wordsInGame; i++) {
            const wordLength = this.startingWordLength + 1 + i;
            const randomWord = Math.round(Math.random() * this.words[wordLength].length);
            this.typeWords[i] = this.words[wordLength][randomWord];
        }
        this.typeWords = this.typeWords.map(element => element.replace(/\r/g, ''));
        this.selectWord();
    }

    selectWord() {
        this.word = this.typeWords[this.wordsTyped];
        this.drawWord();
    }

    drawWord() {
        $('#wordDiv').html(this.word);
        if (typeof this.nextWord !== 'undefined') {
            $('#nextWordDiv').html(this.nextWord);
        } else {
            $('#nextWordDiv').html("Viimane sõna");
        }
        this.updateInfo();
    }

    saveResults() {
        this.chars = 0;
        for (let i = 0; i < this.wordsInGame; i++) {
            this.chars = this.chars + this.startingWordLength + i;
        }

        let wordsPerMinute = ((this.chars / ((this.endTime - this.startTime) / 1000)) * 60).toFixed(0);

        let result = {
            name: this.name,
            time: ((this.endTime - this.startTime) / 1000).toFixed(2),
            words: this.wordsInGame,
            chars: this.chars,
            wordsPerMin: wordsPerMinute
        }

        this.results.push(result);

        this.results.sort((a, b) => parseFloat(b.wordsPerMin) - parseFloat(a.wordsPerMin));

        this.updateResults();

        $.post('server.php', { save: this.results }).done(
            function () {
                console.log("Success");
            }
        );
    }

    updateResults() {
        $('#modal-results').html("");
        const table = $("<table class='result-table'></table>");
        const headerRow = $("<tr></tr>");
        headerRow.append("<th>Number</th>");
        headerRow.append("<th>Nimi</th>");
        headerRow.append("<th>Aeg</th>");
        headerRow.append("<th>Sõnu</th>");
        headerRow.append("<th>Tähti</th>");
        headerRow.append("<th>Täht/min</th>");
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

        $("#modal-results").append(table);
    }
}

let typer = new Typer();