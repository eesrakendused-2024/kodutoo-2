class Typer {
	constructor() {
		this.name = "Lamp"; //kasutaja nimi, mida ta peab mängu alguses sisestam
		this.wordsInGame = 3; //mitu sõna peab trükkima, et mäng lõppeks
		this.wordsTyped = 0; //mitu sõna on trükitud
		this.startingWordLength = 3; //esimese sõna pikkus
		this.words = []; //need sõnad, mis tulevad lemmade failist
		this.typeWords = []; //need sõnad, mida hakkame trükkima
		this.word = "aabits"; //sõna, mida peab trükkima
		this.startTime = 0; //mängu algusaeg
		this.endTime = 0; // mängu lõpuaeg
		this.results = [];
		this.canRestart = true; // Annab võimaluse space bari kasutades mängu taaskäivitada.
		this.opponentTime = 1500; // Vastase trükkimiskiirus
		this.loadFromFile();
	}

	loadFromFile() {
		$.get("lemmad2013.txt", (data) => this.getWords(data));

		$.get("database.txt", (data) => {
			let content = JSON.parse(data).content;
			this.results = content;
			console.log(this.results);
		});
	}

	getWords(data) {
		const dataFromFile = data.split("\n");
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

		$("#submitName").click(() => {
			this.name = $("#nameValue").val();
			// Default name.
			if ($("#nameValue").val() === "") {
				this.name = "Anon";
			}
			this.startingWordLength = parseFloat($("#startingWordLen").val());
			this.wordsInGame = parseFloat($("#wordsInGame").val());
			if (this.startingWordLength < 1) {
				this.startingWordLength = 1; // Set a minimum value
				$("#startingWordLen").val(1); // Update the input value
			}
			if (this.wordsInGame < 1) {
				this.wordsInGame = 1; // Set a minimum value
				$("#wordsInGame").val(1); // Update the input value
			}
			if (this.startingWordLength + this.wordsInGame > 31) {
				$("#error").show();
			} else {
				$("#name").hide();
				$("#openResults").show();

				// Opponent
				$("#opponentContainer").hide();
				$("#opponentCheckBox").hide();

				this.startTyper();
				this.startOnce();
			}
		});

		$("#opponentCheckBox").click(() => {
			$("#opponentContainer").toggle();
			$("#opponentProgress").toggle();
		});

		$("#opponentSubmit").click(() => {
			let wpm = $("#opponentSetting").val();
			this.opponentTime = Math.floor((60 / wpm) * 1000);
			console.log(this.opponentTime);
		});
	}

	startOnce() {
		$(document).on("keypress", (event) => this.shortenWord(event.key));
		$("#restart").on("click", () => this.startTyper());
		$(window).on("keydown", (event) => {
			if (event.keyCode === 32 || (event.which === 32 && this.canRestart)) {
				this.startTyper();
			}
		});
		this.showResults();
	}

	startOpponent() {
		// ChatGPT abiga tehtud
		// Pigem segas kui aitas.
		let opponentProgress = 0;
		const opponentBar = $("#opponentBar");
		const opponentInterval = setInterval(() => {
			opponentProgress++;
			opponentBar.width((opponentProgress / this.wordsInGame) * 100 + "%");
			if (opponentProgress >= this.wordsInGame) {
				clearInterval(opponentInterval);
			}
		}, this.opponentTime); // Adjust the interval based on your opponent's typing speed
	}

	startTyper() {
		if (this.canRestart) {
			this.canRestart = false;
			$("#restart").hide();
			this.canRestart = false;
			$("#score").hide();
			this.wordsTyped = 0;
			this.generateWords();
			this.updateInfo();
			this.startTime = performance.now();
			this.startOpponent();
			console.log(this.startingWordLength);
		}
	}

	updateInfo() {
		$("#gameinfo").html(
			this.wordsTyped + 1 + ". sõna " + this.wordsInGame + "-st"
		);
	}

	shortenWord(keypressed) {
		if (this.word.charAt(0) != keypressed) {
			$("#container").css("background", "linear-gradient(lightpink, red)");
			setTimeout(() => {
				$("#container").css(
					"background",
					"linear-gradient(rgb(248, 248, 199), rgb(223, 179, 91))"
				);
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
			this.canRestart = true;
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
			$("#restart").show();
			$("#score").show();
		}
	}

	generateWords() {
		for (let i = 0; i < this.wordsInGame; i++) {
			const wordLength = this.startingWordLength + i;
			const randomWord = Math.round(
				Math.random() * this.words[wordLength].length
			);
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
		let charsTyped =
			this.wordsInGame *
			(2 * this.startingWordLength + (this.wordsInGame - 1) * 1);
		let wordsPerMin = (
			(charsTyped / ((this.endTime - this.startTime) / 1000)) *
			60
		).toFixed(0);

		let result = {
			name: this.name,
			time: ((this.endTime - this.startTime) / 1000).toFixed(2),
			words: this.wordsInGame,
			chars: charsTyped,
			wordsPerMin: wordsPerMin,
		};

		this.results.push(result);

		this.results.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

		this.showResults();

		$.post("server.php", { save: this.results }).done(function () {
			console.log("Success");
		});
	}

	showResults() {
		let imgSource;
		// Made using the help of chatGPT.
		// Mainly it helped with smaller issues, thinking through the problems and typos.
		$("#openResults").on("click", function () {
			$("#resultsModal").css("display", "block");
			$("#openResults").css("display", "none");

			// Clears the previous results momentarily
			$("#resultsTable").html("");

			// Since its clearing all html, I'll have to add the headings seperately.
			$("#resultsTable").append(
				"<tr><th>Pos</th><th>Nimi</th><th>Aeg</th><th>Sõnad</th><th>Tähemärgid</th><th>WPM</th><th></th></tr>"
			);

			for (let i = 0; i < typer.results.length; i++) {
				if (i === 10) {
					break;
				}

				// Picture source logic
				if (typer.results[i].wordsPerMin < 40) {
					imgSource = "img/Slowest.svg";
				} else if (typer.results[i].wordsPerMin < 50) {
					imgSource = "img/Slower.svg";
				} else if (typer.results[i].wordsPerMin < 60) {
					imgSource = "img/Avg.svg";
				} else if (typer.results[i].wordsPerMin < 70) {
					imgSource = "img/Faster.svg";
				} else if (
					typer.results[i].wordsPerMin >= 70 &&
					typer.results[i].wordsPerMin < 120
				) {
					imgSource = "img/Fast.svg";
				} else if (typer.results[i].wordsPerMin >= 120) {
					imgSource = "img/Fastest.svg";
				} else {
					imgSource = "img/Rock.svg";
				}

				let tableRow = $("<tr>").append(
					$("<td>").text(i + 1),
					$("<td>").text(typer.results[i].name),
					$("<td>").text(typer.results[i].time),
					$("<td>").text(typer.results[i].words),
					$("<td>").text(typer.results[i].chars),
					$("<td>").text(typer.results[i].wordsPerMin),
					$("<td>").append(
						$("<img>")
							.attr("src", imgSource)
							.attr("alt", "Kiiruse pilt " + i)
							.css({ width: "35px", height: "35px" })
					)
				);

				$("#resultsTable").append(tableRow);
			}
		});

		$(".close").on("click", () => {
			$("#resultsModal").css("display", "none");
			$("#openResults").css("display", "inline-block");
		});

		window.onclick = function (event) {
			if (
				event.target == $("#resultsModal")[0] ||
				event.target == $(".results")
			) {
				$("#resultsModal").css("display", "none");
				$("#openResults").css("display", "inline-block");
			}
		};
	}
}

let typer = new Typer();
