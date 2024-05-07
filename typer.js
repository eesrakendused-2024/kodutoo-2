class Typer {
    constructor() {
        this.name = "Anonüümne"; //kasutaja nimi, mida ta peab mängu alguses sisestama
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
        this.initializeDarkMode();
    }

    initializeDarkMode() {
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode'); 
            const elements = document.querySelectorAll('.dark-mode-change');
            elements.forEach(element => {
                element.classList.toggle('dark-mode');
            });
        });
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
        //console.log(data);
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

        console.log(this.words)

        //console.log(this.words);
        $('#submitName').click(
            () => {
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

            }
        );
    }

    startOnce() {
        $(document).on("keypress", (event) => this.shortenWord(event.key));
        $('#restart').on('click', () => this.startTyper());

        $('#showResults').click(() => {
            this.showResults(); 
        });

        $('#closeModal, #closeResults').click(() => {
            $('#myModal').hide();
        });
    }

    startTyper() {
        $('#restart, #score').hide();
        this.wordsTyped = 0;
        this.generateWords();
        this.updateInfo();
        this.startTime = performance.now();
        this.hideSpeedImage()
        console.log(this.startingWordLength);
    }

    updateInfo() {
        $('#gameinfo').html((this.wordsTyped + 1) + ". sõna " + this.wordsInGame + "-st");
    }

    shortenWord(keypressed) {
        const lightBackgroundColor = "#d7c3ffe3";
        const darkBackgroundColor = "#111111";
        const pinkBackgroundColor = "#fe7171";
    
        const currentBackgroundColor = document.getElementById('container').style.backgroundColor;
    
        if (this.word.charAt(0) !== keypressed) {
            document.getElementById('container').style.backgroundColor = pinkBackgroundColor;
            setTimeout(() => {
                if (currentBackgroundColor !== darkBackgroundColor) {
                    document.getElementById('container').style.backgroundColor = currentBackgroundColor;
                }
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
            $('#score').html(this.name + ", sinu aeg oli: " + ((this.endTime - this.startTime) / 1000).toFixed(2) + " sekundit.");
            this.saveResults();
            $('#restart, #score').show();
            this.updateSpeedImage();
        }
    }
    
    hideSpeedImage() {
        $("#scorePic").html("");
    }

    updateSpeedImage() {
        let wordsPerMinute = ((this.chars / ((this.endTime - this.startTime) / 1000)) * 60).toFixed(0);
        let speedImage = "";
        if (wordsPerMinute >= 120) {
            speedImage = "fast.jpg";
        } else if (wordsPerMinute >= 60) {
            speedImage = "medium.jpg";
        } else {
            speedImage = "slow.jpg";
        }
        $("#scorePic").html(`<img src="${speedImage}" alt="speed">`);
    }

    generateWords() {
        for (let i = 0; i < this.wordsInGame; i++) {
            const wordLength = this.startingWordLength + i;
            const randomWord = Math.round(Math.random() *
                this.words[wordLength].length);
            //console.log(wordLength, randomWord);

            this.typeWords[i] = this.words[wordLength][randomWord];
        }
        console.log(this.typeWords);
        this.selectWord();
    }

    selectWord() {
        this.word = this.typeWords[this.wordsTyped];
        this.drawWord();
    }

    drawWord() {
        $('#wordDiv').html(this.word);
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

        $.post('server.php', { save: this.results }).done(
            function () {
                console.log("Success");
            }
        );
    }


    loadDataFromFile() {
        $.get("database.txt", (data) => {
            const lines = data.split("\n");
            lines.forEach(line => {
                const fields = line.split(" ");
                const number = fields[0];
                const name = fields[1];
                const time = fields[2];
                const words = fields[3];
                const chars = fields[4];
                const wordsPerMin = fields[5];

                const row = `<tr><td>${number}</td><td>${name}</td><td>${time}</td><td>${words}</td><td>${chars}</td><td>${wordsPerMin}</td></tr>`;
                this.results.push({ number, name, time, words, chars, wordsPerMin }); 
            });
        });
    }

    showResults() {
        this.results.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

        let resultsContent = "<table><thead><tr><th>Number</th><th>Nimi</th><th>Aeg</th><th>Sõnade arv</th><th>Tähemärgid</th><th>Punktid</th></tr></thead><tbody>";
        for (let i = 0; i < Math.min(this.results.length, 10); i++) {
            resultsContent += `<tr><td>${i + 1}</td><td>${this.results[i].name}</td><td>${this.results[i].time}</td><td>${this.results[i].words}</td><td>${this.results[i].chars}</td><td>${this.results[i].wordsPerMin}</td></tr>`;
        }
        resultsContent += "</tbody></table>";
        $('#myModal #resultsContainer').html(resultsContent);
        $('#myModal').show();
    }

}

let typer = new Typer();
