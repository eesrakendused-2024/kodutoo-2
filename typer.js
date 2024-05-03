//let playerName = prompt('Palun sisesta oma nimi')

class Typer {
  constructor() {
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
    this.loadFromFile();
  }

  loadFromFile() {
    $.get("lemmad2013.txt", (data) => this.getWords(data));

    $.get("database.txt", (data) => {
      console.log("datata", data);
      let content = JSON.parse(data).content;
      this.results = content;
    });
  }

  getWords(data) {
    //console.log(data);
    const dataFromFile = data.split("\n");
    this.separateWordsByLength(dataFromFile);
  }

  stopTyper() {
    $(document).off("keypress");
  }

  separateWordsByLength(data) {
    for (let i = 0; i < data.length; i++) {
      const wordLength = data[i].length;

      if (this.words[wordLength] === undefined) {
        this.words[wordLength] = [];
      }

      this.words[wordLength].push(data[i]);
    }

    console.log(this.words);

    $("#vahetaMangija").click(() => {
      $("#name").show();
      this.stopTyper();
    });

    //console.log(this.words);
    $("#submitName").click(() => {
      this.name = $("#nameValue").val();
      this.startingWordLength = parseFloat($("#startingWordLength").val());
      this.wordsInGame = parseFloat($("#wordsInGame").val());
      if (this.startingWordLength + this.wordsInGame > 31) {
        $("#error").show();
      } else {
        $("#name").hide();

        this.startTyper();
        this.startOnce();
      }
    });
  }

  startOnce() {
    $(document).on("keypress", (event) => this.shortenWord(event.key));
    $("#restart").on("click", () => this.startTyper());
    this.showResults();
  }

  startTyper() {
    $("#restart, #score").hide();
    this.wordsTyped = 0;
    this.generateWords();
    this.updateInfo();
    this.startTime = performance.now();
    this.hideSpeedImage();
    console.log(this.startingWordLength);
  }

  updateInfo() {
    $("#gameinfo").html(
      this.wordsTyped + 1 + ". sõna " + this.wordsInGame + "-st"
    );
  }

  shortenWord(keypressed) {
    console.log("keypressed", keypressed);
    console.log("this.wrod", this.word.charAt(0));

    if (this.word.charAt(0) != keypressed) {
      document.getElementById("container").style.backgroundColor = "lightpink";
      setTimeout(function () {
        document.getElementById("container").style.backgroundColor =
          "rgb(248, 217, 240)";
      }, 100);
    }

    if (this.word.length > 1 && this.word.charAt(0) == keypressed) {
      this.word = this.word.slice(1);
      this.drawWord();
    } else if (
      this.word.length == 1 &&
      this.word.charAt(0) == keypressed &&
      this.wordsTyped != this.wordsInGame - 1
    ) {
      this.wordsTyped++;
      this.selectWord();
    } else if (
      this.word.length == 1 &&
      this.word.charAt(0) == keypressed &&
      this.wordsTyped == this.wordsInGame - 1
    ) {
      this.endTime = performance.now();
      this.word = this.word.slice(1);
      this.drawWord();
      $("#score").html(
        this.name +
          ", sinu aeg oli: " +
          ((this.endTime - this.startTime) / 1000).toFixed(2) +
          " sekundit."
      );
      this.saveResults();
      this.updateSpeedImage();
      $("#restart, #score").show();
    }
  }

  updateSpeedImage() {
    let cpm = (this.chars / ((this.endTime - this.startTime) / 1000)) * 60;
    let speedImage = "";

    if (cpm >= 350) {
      speedImage = "fast.jpg";
    } else if (cpm >= 300) {
      speedImage = "medium.jpg";
    } else {
      speedImage = "slow.jpg";
    }

    $("#scorePic").html(`<img src="${speedImage}" alt="speed">`);
  }

  hideSpeedImage() {
    $("#scorePic").html("");
  }

  generateWords() {
    for (let i = 0; i < this.wordsInGame; i++) {
      const wordLength = this.startingWordLength + i;
      const randomWord = Math.round(
        Math.random() * this.words[wordLength].length
      );
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
    $("#wordDiv").html(this.word);
    this.updateInfo();
  }

  saveResults() {
    this.chars = 0;
    for (let i = 0; i < this.wordsInGame; i++) {
      this.chars = this.chars + this.startingWordLength + i;
      console.log(this.chars);
    }

    let wordsPerMinute = (
      (this.chars / ((this.endTime - this.startTime) / 1000)) *
      60
    ).toFixed(0);
    console.log(wordsPerMinute);

    let result = {
      name: this.name,
      time: ((this.endTime - this.startTime) / 1000).toFixed(2),
      words: this.wordsInGame,
      chars: this.chars,
      wordsPerMin: wordsPerMinute,
    };

    this.results.push(result);

    this.results.sort(
      (a, b) => parseFloat(b.wordsPerMin) - parseFloat(a.wordsPerMin)
    );

    this.showResults();

    $.post("server.php", { save: this.results }).done(function () {
      console.log("Success");
    });
  }

  showResults() {
    $("#results").html("");
    populateResultsTable(this.results);
  }
}

var modal = document.getElementById("myModal");

var btn = document.getElementById("myBtn");

var span = document.getElementsByClassName("close")[0];

btn.onclick = function () {
  modal.style.display = "block";
};

span.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function populateResultsTable(results) {
  var tableBody = document.getElementById("results");

  results.forEach(function (result, i) {
    var row = tableBody.insertRow();
    var numberCell = row.insertCell(0);
    var nameCell = row.insertCell(1);
    var timeCell = row.insertCell(2);
    var wordsCell = row.insertCell(3);
    var charsCell = row.insertCell(4);
    var wordsPerMinCell = row.insertCell(5);

    numberCell.textContent = i + 1;
    nameCell.textContent = result.name;
    timeCell.textContent = result.time;
    wordsCell.textContent = result.words;
    charsCell.textContent = result.chars;
    wordsPerMinCell.textContent = result.wordsPerMin;
  });
}

let typer = new Typer();
