$(document).ready(function () {
    const global = {
        incorrect: 0,
        pathname: window.location.pathname,
        score: 0,
        url: (
            window.location.pathname === "/"
                ? "http://localhost:8000"
                : "https://deanophp.github.io/quizzy-msp2/"
        )
    };

    /**
     * 
     */
    const settings = function () {
        $("#settings").css("visibility", "visible");
        const highScore = getFromLocalStorage();
        $('#settingsHighScore').text(highScore);

        const sound = checkSoundEnabled();

        // Toggle sound on or off
        $("#soundOnOff").on("click", function() {
            if (sound === "true") {
                localStorage.setItem('soundEnabled', "false")
                alert('The volume is turned off');
                $(this).text('Turn Sound On');  // Update button text to reflect the new state
            } else {
                localStorage.setItem('soundEnabled', "true");
                alert('The volume is turned on');
                $(this).text('Turn Sound Off');  // Update button text to reflect the new state
            }
        }); 

        $('#backToHome').on('click', function() {
            window.location.href = '/';
        })
    }

    /**
     * Check localStorage to see whether sound is enabled
     */
    const checkSoundEnabled = function() {
        let sound = localStorage.getItem("soundEnabled");

        if (sound === null) {
            sound = localStorage.setItem("soundEnabled", "true")
        } else {
            return localStorage.getItem("soundEnabled")
        }
    
        return sound;
    }

    /**
     * @param {string} audioId 
     */
    const playSound = function (audioId) {
        const sound = checkSoundEnabled()
        if (sound === "true") {
            let audio = document.getElementById(audioId)
            audio.play().catch(function(error) {
                console.log("Audio play was prevented:", error);
            });
        }
    };

    /**
     * @returns data from the trivia api
     */
    const fetchData = async function () {
        try {
            const response = await fetch(
                "https://the-trivia-api.com/api/questions?limit=1&difficulty=easy"
            );
            const data = await response.json();

            return data;
        } catch (error) {
            console.log("Error responce: " + error);
        }
    };

    /**
     * Give comments
     */
    const startGame = async function () {
        $("#score").text(global.score);

        // Reset the buttons to their default state
        // Using disabled, false allows the button to be clickable again
        $(".choice-btn").each(function () {
            $(this).css({
                background: "#fafafa",
                color: "#333"
            }).prop("disabled", false); // Re-enable buttons
        });

        const questions = await fetchData();
        $("#question-area").text(questions[0].question);

        const incorrectAnswers = questions[0].incorrectAnswers;
        const correctAnswer = questions[0].correctAnswer;
        const allAnswers = [...incorrectAnswers, correctAnswer];

        // Shuffle allAnswers
        allAnswers.sort(() => Math.random() - 0.5);

        // Store the answers inside the each choice-btn class
        $(".choice-btn").each(function (index) {
            if (index < allAnswers.length) {
                $(this).text(allAnswers[index]);
            }
        });

        checkAnswers(correctAnswer);
    };

    /**
     * @param {*} correctAnswer
     */
    const checkAnswers = function (correctAnswer) {
        // .off("click") removes any existing click events
        // .on("click") attaches a new event to the btn
        // .prop("disabled": true) means the button is disabled
        $(".choice-btn").off("click").on("click", function () {

            $(".choice-btn").off("click").prop("disabled", true);

            if ($(this).text() === correctAnswer) {
                $(this).css({
                    background: "green",
                    color: "#fafafa"
                });

                playSound("correctSound")

                global.score += 1;
            } else {
                $(this).css({
                    background: "red",
                    color: "#fafafa"
                });

                // Highlight the correct answer
                setTimeout(function () {
                    $(".choice-btn").each(function (index, ans) {
                        if ($(ans).text() === correctAnswer) {
                            $(ans).css({
                                background: "green",
                                color: "#fafafa"
                            });
                        }
                    });
                }, 1000);

                playSound("incorrectSound")

                showIncorrectAnswers();

                $("html, body").animate({
                    scrollTop: $("#three-incorrect-answers-crosses")
                    .offset()
                    .top
                }, 1000);
            }

            // Wait for 3 seconds and then start a new game round
            setTimeout(function() {
                startGame();
            }, 3000);
        });
    };

    /**
     * Give comments
     */
    const showIncorrectAnswers = function() {
        const crossbox = $(".cross-box");

        if (global.incorrect < crossbox.length) {
            $(crossbox[global.incorrect]).css({
                visibility: "visible"
            });
            // Increment incorrect count
            global.incorrect += 1;
        }

        if (global.incorrect > 2) {
            setTimeout(function() {
                $(".cross-box").css({
                    visibility: "hidden"
                });
            }, 2000);

            setTimeout(function() {
                gameOver();
            }, 3000);
        }
    };

    /**
     * @param {number} score
     */
    const settingToLocalStorage = function(score) {
        let getFromStorage = getFromLocalStorage();

        if (score > getFromStorage) {
            localStorage.setItem("score", score);
        }
    };

    /**
     * @returns
     */
    const getFromLocalStorage = function() {
        const result = JSON.parse(localStorage.getItem("score"));
        return result;
    };

    const resetScore = function() {
        $("#resetScore").on("click", function () {
            if (
                confirm("Are you sure you want to reset your highest score?")
            ) {
                localStorage.removeItem("score");
                $("#highestScore").text("0");
            }
        });
    };
    
    /**
     * Give comment
     */
    const displayHighestScore = function() {
        const highestScore = getFromLocalStorage();
    
        $("#highest-score-so-far").append(
            "Highest score " + 
            "<span id='highestScore'>" + 
            (highestScore === null ? 0 : highestScore) + 
            "</span>"
        );
    };
    
    /**
     * Comment here
     */
    const gameOver = function() {
        // Get the div that is going to display the message
        $("#game-over").css({
            visibility: "visible"
        });

        // $("#end-game")[0].play();
        playSound("end-game")

        // setting the score in local storage
        const highest_score = global.score;
        settingToLocalStorage(highest_score);

        // display the user highest score sor far
        const highest_recorded_score = getFromLocalStorage();
        $("#game-over").append("<h1>Game Over</h1>");

        if (global.score > highest_recorded_score) {
            $("#game-over").append("<p>Whoop Whoop you have broke your record</p>");
            // Add some graphics and music video 
        } else if (global.score < 10) {
            $("#game-over").append(`<p>A Monkey could do better than ${global.score}</p>`);
        } else if (global.score > 10 && global.score < 20) {
            $("#game-over").append(`<p>${global.score} is not bad. Keep trying I"m sure you can do better</p>`);
        } else {
            $("#game-over").append(`<p>${global.score} is a great effort</p>`);
        }

        $("#game-over").append(`<p>Your highest score so far is ${highest_recorded_score}</p>`);
        $("#game-over").append(`<p>By Dean Lark</p>`);

        // set the score and all setting from above back to start game settings. Maybe put this in a function of its own
        global.score = 0;
        global.incorrect = 0;

        // Redirect the user back to index 
        setTimeout(function() {
            window.location.href = global.url;
        }, 4000);
    };

    /**
     * Comments here
     */
    const page_switch = function() {
        switch (global.pathname) {
            case "/":
            case "/quizzy-msp2/":
                $("#cog-icon").on("click", settings);
                $("#sound-btn").on("click", function() {
                     playSound("family-splash");

                     setTimeout(function() {
                        window.location.href = "game.html"
                     }, 7000)
                })  
                break;
            case "/game.html":
            case "/quizzy-msp2/game.html":
                startGame();
                console.log(global.soundEnabled)
                displayHighestScore();
                resetScore();
                break;
            default:
                console.log("Something has gone wrong");
        }
    };

    page_switch();
});