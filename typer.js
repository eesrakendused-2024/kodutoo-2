
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
        this.lastGameTime = 0; // KT2 #8 uus feature - kui aeg tuli parim siis blingib punase ja kollase värvusega 2 x

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
        $('#restart, #score, #showResultsBtn').hide(); // KT2 #2 modal akna nupu peitmine
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
            $('#score').html(this.name + ", sinu aeg oli: " + ((this.endTime-this.startTime)/1000).toFixed(2) + " sekundit.");
            this.saveResults();
            $('#restart, #score, #showResultsBtn').show(); // KT2 #2 modal akna nupu näitamine, kasut https://www.w3schools.com/howto/howto_css_modals.asp
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
        // KT2 #8 uus funktsionaalsus, viimase aja säilitamine
        this.lastGameTime = result.time;
 
        this.results.sort((a, b) => parseFloat(b.wordsPerMin) - parseFloat(a.wordsPerMin));

        this.showResults();

        $.post('server.php', {save: this.results}).done(
            function(){
                console.log("Success");
            }
        );
    }

    showResults() {
        // KT2 #4 kiirused https://www.typingpal.com/en/blog/good-typing-speed pluss mõned aeglasemad
        const speeds = {
            'Very slow': { value: 0, color: 'red' },
            'Slow': { value: 100, color: 'red' },
            'Close to average': { value: 150, color: 'black' },
            'Average speed': { value: 200, color: 'black' },
            'Above average speed': { value: 250, color: 'blue' },
            'Productive speed': { value: 300, color: 'blue' },
            'High speed': { value: 350, color: 'blue' },
            'Competitive speed': { value: 600, color: 'blue' }
        };
    
        let resultsContent = '<table>';
    
        resultsContent += '<tr><th>No</th><th>Name</th><th>Time</th><th>Words</th><th>Chars</th><th>CPM</th><th>Speed</th></tr>';
    
        for (let i = 0; i < this.results.length; i++) {
            if (i === 10) { break; }
            resultsContent += '<tr class="result-row';
    
            let speedCategory = '';
            for (const category in speeds) {
                if (this.results[i].wordsPerMin <= speeds[category].value) {
                    speedCategory = category;
                    break;
                }
            }
    
            resultsContent += ' result-' + speedCategory.toLowerCase().replace(/ /g, '-') + '">'; // KT2 #4 lisaks tekstile nädiatakse ka värvidega kas aeglane keskmine või kiire
    
            resultsContent += '<td>' + (i + 1) + '</td>';
            resultsContent += '<td>' + this.results[i].name + '</td>';
            resultsContent += '<td>' + this.results[i].time + '</td>';
            resultsContent += '<td>' + this.results[i].words + '</td>';
            resultsContent += '<td>' + this.results[i].chars + '</td>';
            resultsContent += '<td>' + this.results[i].wordsPerMin + '</td>';
            resultsContent += '<td style="color:' + speeds[speedCategory].color + '">' + speedCategory + '</td>'; 
    
            resultsContent += '</tr>';
        }
    
        resultsContent += '</table>';
    
        // Populate the modal content with resultsContent
        document.getElementById('resultsContent').innerHTML = resultsContent;
        
        // KT2 #8 uus funktsionaalsus kiireimale blingitamine
        console.log("showResult" + parseFloat(this.results[0].time) + " " + parseFloat(this.lastGameTime));
        if (parseFloat(this.results[0].time) == parseFloat(this.lastGameTime)) {
            console.log("Fastest: blink")
//            document.getElementById('modalContent').classList.add('blink-red');
            const blinkDuration = 1500; 
            const blinkCount = 2; 
    
            for (let i = 0; i < blinkCount; i++) {
                setTimeout(() => {
                    document.documentElement.style.backgroundColor = 'red';
                    setTimeout(() => {
                        document.documentElement.style.backgroundColor = 'yellow';
                    }, blinkDuration / 3*1);
                    setTimeout(() => {
                        document.documentElement.style.backgroundColor = ''; // reset                
                    }, blinkDuration / 3*2);
                }, i * blinkDuration);
            }
        }
    }      
}

// KT2 #2 modal ChatGDP
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("showResultsBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
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

// Add event listener for "Show Results" button
document.getElementById("showResultsBtn").addEventListener("click", function() {
    // Open the modal
    console.log("Openning Modal");
    document.getElementById("myModal").style.display = "block";
    
    console.log("Populate Modal");
    // Populate the modal with results
    document.getElementById("resultsContent").innerHTML = $('#results').html();
});

// Function to populate modal with results
function populateModal() {
    // Open the modal
    document.getElementById("myModal").style.display = "block";

    // Call showResults() to fetch results and populate modal
    typer.showResults();
}

// Add event listener for "Show Results" button
document.getElementById("showResultsBtn").addEventListener("click", populateModal);

// KT2 #5 mobiilivaates tekstiväli, mingi jama
window.addEventListener('DOMContentLoaded', (event) => {
    if (window.innerWidth <= 600) {
        const hiddenInput = document.getElementById('hiddenInput');
        hiddenInput.focus();
    }
});

let typer = new Typer();