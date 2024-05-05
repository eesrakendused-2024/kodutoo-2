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

        this.imageEnabled = false;
        this.resultImage = document.getElementById('resultImage');

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
        $('#restart, #score').hide();
        this.wordsTyped = 0;
        this.generateWords();
        this.updateInfo();
        this.startTime = performance.now();
        console.log(this.startingWordLength);
        resultImage.style.display = 'none';
        this.imageEnabled = false;
    }

    updateInfo(){
        $('#gameinfo').html((this.wordsTyped + 1) + ". sõna " + this.wordsInGame + "-st");
    }

    shortenWord(keypressed){
        //console.log(keypressed);

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
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped == this.wordsInGame - 1){
            this.endTime = performance.now();
            this.word = this.word.slice(1);
            this.drawWord();
            const pTime = (this.endTime-this.startTime)/1000;
            $('#score').html(this.name + ", sinu aeg oli: " + (pTime + " sekundit."));
            this.saveResults();
            $('#restart, #score').show();
                if ((pTime>20)) {
                    resultImage.src = 'https://png.pngtree.com/element_our/png/20181107/pngtree-snail-png-image_233445.jpg'; 
                    resultImage.style.display = 'block';
                    imageEnabled = true;
                } else if (pTime>15){
                    resultImage.src = 'https://png.pngtree.com/png-vector/20230324/ourmid/pngtree-simple-flat-hand-draw-cute-cartoon-turtle-vector-png-image_6667208.png'; 
                    resultImage.style.display = 'block';
                    imageEnabled = true;
                }else if (pTime>7){
                    resultImage.src = 'https://icon2.cleanpng.com/20180302/bjq/kisspng-easter-bunny-bugs-bunny-hare-rabbit-clip-art-cartoon-bunny-hand-painted-rabbit-gray-back-5a99231d4b8e34.8284617815199854373095.jpg';
                    resultImage.style.display = 'block';
                    imageEnabled = true;
                } else{
                    resultImage.src = 'https://p7.hiclipart.com/preview/202/989/159/cheetah-lion-tiger-cat-drawing-cheetah-thumbnail.jpg';
                    resultImage.style.display = 'block';
                    imageEnabled = true;
                }
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
        let char = 0;
        for(let i = this.startingWordLength; i<=this.wordsInGame;i++){
            char + i;
        }

        let result = {
            name: this.name,
            time: ((this.endTime-this.startTime)/1000).toFixed(2),
            words: this.wordsInGame,
            chars: char
        }

        this.results.push(result);

        this.results.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

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
            $("#tResults").append("<tr>" + "<td>" +(i+1) + "." + "</td>" + "<td>" +this.results[i].name + "</td>" + "<td>" +this.results[i].time +
            "</td>" + "<td>" +this.results[i].words + "</td>" + "<td>"+ this.results[i].chars + "</td>" +"</tr>");
        }
    }
    
}
//Code from https://www.w3schools.com/howto/howto_css_modals.asp
//  Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


let typer = new Typer();