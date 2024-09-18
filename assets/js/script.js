$(document).ready(function () {
    const global = {
        incorrect: 0,
        pathname: window.location.pathname,
        score: 0,
        url: (
            window.location.pathname === "/"
                ? "http://localhost:8000/"
                : "https://deanophp.github.io/quizzy-msp2/"
        )
    };

    /**
     * Initializes and displays the game settings screen.
     * 
     * The `settings` function is responsible for resetting the score, displaying the settings interface,
     * retrieving the current high score from local storage, and configuring the sound settings.
     * 
     * - The high score is displayed, defaulting to '0' if no score is stored.
     * - The current sound status (on or off) is retrieved from local storage and the appropriate button text 
     *   is set to either "Turn Sound Off" or "Turn Sound On".
     * - The function also provides functionality to toggle the sound setting. When the user clicks the 
     *   "soundOnOff" button, the sound state is toggled between enabled and disabled. The new state is saved 
     *   to local storage, the user is alerted to the change, and the button text is updated accordingly.
     */
    const settings = function () {
        resetScore();

        $("#settings").css("visibility", "visible");
        $("#title").css("visibility", "hidden");
        const highScore = getFromLocalStorage();
        $("#settingsHighScore").text(highScore === null ? '0' : highScore);

        const sound = checkSoundEnabled();
        $("#soundOnOff").text(sound === "true" ? "Turn Sound Off" : "Turn Sound On");

        // Toggle sound on or off
        $("#soundOnOff").on("click", function () {
            const currentSound = checkSoundEnabled();
            if (currentSound === "true") {
                localStorage.setItem('soundEnabled', "false")
                alert('The volume is turned off');
                $(this).text('Turn Sound On');  // Update button text to reflect the new state
            } else {
                localStorage.setItem('soundEnabled', "true");
                alert('The volume is turned on');
                $(this).text('Turn Sound Off');  // Update button text to reflect the new state
            }
        });

        $('#backToHome').on('click', function () {
            window.location.href = global.url;
        })
    }

    /**
     * Retrieves the current sound setting from localStorage.
     * 
     * The `checkSoundEnabled` function checks if the 'soundEnabled' value is stored in localStorage.
     * 
     * - If the value exists, it returns the current sound setting ("true" for enabled or "false" for disabled).
     * - If no value is found (i.e., the key doesn't exist), it sets the default sound setting to "true" (enabled),
     *   stores it in localStorage, and returns this default value.
     * 
     * This function ensures that the sound setting is always defined in localStorage, defaulting to "true" if
     * the setting was not previously saved.
     */
    const checkSoundEnabled = function () {
        let sound = localStorage.getItem("soundEnabled");

        if (sound === null) {
            sound = localStorage.setItem("soundEnabled", "true")
        } else {
            return localStorage.getItem("soundEnabled")
        }

        return sound;
    }

    /**
     * Plays a sound if sound is enabled in the settings.
     * 
     * @param {string} audioId - The ID of the HTML audio element to be played.
     * 
     * The `playSound` function checks whether sound is enabled by calling the `checkSoundEnabled` function.
     * 
     * - If sound is enabled (i.e., the setting in localStorage is "true"), it retrieves the audio element by its 
     *   `audioId` from the DOM and attempts to play the sound.
     * - If there is an issue playing the sound (e.g., browser restrictions), an error is caught and logged to 
     *   the console, displaying the error message.
     * 
     * This function ensures that sounds are only played when sound is enabled in the user’s settings.
     */
    const playSound = function (audioId) {
        const sound = checkSoundEnabled()
        if (sound === "true") {
            let audio = document.getElementById(audioId)
            audio.play().catch(function (error) {
                console.log("Audio play was prevented:", error);
            });
        }
    };

    /**
     * Fetches trivia question data from the trivia API.
     * 
     * @returns {Promise<Object>} The trivia question data from the API or `undefined` if an error occurs.
     * 
     * The `fetchData` function is an asynchronous function that retrieves trivia questions from 
     * the provided API endpoint.
     * 
     * - It sends a request to fetch a single trivia question with an easy difficulty level.
     * - The function waits for the response, parses it as JSON, and returns the trivia data.
     * - If an error occurs during the request (e.g., network issues), the error is caught and logged 
     *   to the console.
     * 
     * This function handles API communication and returns the trivia data for further processing.
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
     * Initializes and starts the game by setting up the UI and loading a trivia question.
     * 
     * This function performs several tasks:
     * 1. Scrolls the page to the top smoothly.
     * 2. Displays the current score.
     * 3. Resets the answer buttons to their default state (re-enabling them and restoring their default style).
     * 4. Fetches a new trivia question from the API.
     * 5. Populates the question and possible answers in the UI.
     * 6. Randomly shuffles the answers and assigns them to buttons.
     * 7. Initiates the answer checking logic by passing the correct answer to the `checkAnswers` function.
     */
    const startGame = async function () {
        $("html, body").animate({
            scrollTop: $("body").offset().top
        }, 500)

        $("#score").text(global.score);

        $(".choice-btn").each(function () {
            $(this).css({
                background: "#fafafa",
                color: "#333"
            }).prop("disabled", false);
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

   /* Handles the logic for checking the user's selected answer.
    * 
    * @param {*} correctAnswer - The correct answer for the current question.
    * This function:
    * 1. Attaches a click event to the answer buttons that checks whether the clicked button contains the correct answer.
    * 2. Disables all buttons after a selection is made to prevent multiple clicks.
    * 3. Provides visual feedback by changing the background color of the selected answer: green for correct, red for incorrect.
    * 4. Plays an appropriate sound based on whether the selected answer is correct or incorrect.
    * 5. Highlights the correct answer after a short delay if the user's selection was incorrect.
    * 6. Scrolls the page to a specific section if the user selects an incorrect answer.
    * 7. Automatically starts a new game round after a 3-second delay.
    */
   const checkAnswers = function (correctAnswer) {
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
            setTimeout(function () {
                startGame();
            }, 3000);
        });
    };

    /**
     * Displays visual indicators for incorrect answers and handles game over logic.
     * 
     * The function:
     * 1. Increases the count of incorrect answers and displays a "cross" icon for each incorrect answer.
     * 2. If the number of incorrect answers exceeds 2 (i.e., the player has reached the maximum number of incorrect answers),
     *    it hides all cross icons after a short delay and triggers the game over sequence.
     */
    const showIncorrectAnswers = function () {
        const crossbox = $(".cross-box");

        if (global.incorrect < crossbox.length) {
            $(crossbox[global.incorrect]).css({
                visibility: "visible"
            });
            // Increment incorrect count
            global.incorrect += 1;
        }

        if (global.incorrect > 2) {
            setTimeout(function () {
                $(".cross-box").css({
                    visibility: "hidden"
                });
            }, 2000);

            setTimeout(function () {
                gameOver();
            }, 3000);
        }
    };

    /**
     * Saves the given score to localStorage if it is higher than the stored high score.
     * 
     * @param {number} score - The current score to be saved if it exceeds the existing high score.
     * 
     * This function retrieves the current high score from localStorage using the `getFromLocalStorage` function.
     * 
     * - If the provided `score` is greater than the stored high score, it updates the high score in localStorage.
     * - If the current score is less than or equal to the stored high score, no update occurs.
     */
    const settingToLocalStorage = function (score) {
        let getFromStorage = getFromLocalStorage();

        if (score > getFromStorage) {
            localStorage.setItem("score", score);
        }
    };

    /**
     * Retrieves the high score from localStorage.
     * 
     * @returns {number|null} The high score stored in localStorage, or `null` if no score is found.
     * 
     * This function fetches the value associated with the key "score" from localStorage, parses it as a number
     * (using JSON.parse), and returns it.
     * 
     * - If no score is found in localStorage, it returns `null`.
     */
    const getFromLocalStorage = function () {
        const result = JSON.parse(localStorage.getItem("score"));
        return result;
    };

    /**
     * Resets the high score when the reset button is clicked.
     * 
     * This function attaches a click event handler to the element with the ID `#resetScore`.
     * 
     * - When the user clicks the reset button, a confirmation dialog is shown asking if they are sure they want to reset the high score.
     * - If the user confirms, the high score is removed from localStorage and the displayed high score in the settings is reset to "0".
     */
    const resetScore = function () {
        $("#resetScore").on("click", function () {
            if (
                confirm("Are you sure you want to reset your highest score?")
            ) {
                localStorage.removeItem("score");
                $("#settingsHighScore").text("0");
            }
        });
    };

    /**
     * Handles the game over sequence and displays a final message based on the player's score.
     * 
     * This function:
     * 1. Scrolls the page to the top.
     * 2. Displays the "Game Over" message and plays the game over sound.
     * 3. Saves the player's score to localStorage if it's higher than the previous high score.
     * 4. Displays a personalized message based on the player's final score.
     * 5. Resets global variables (`score` and `incorrect`) for a new game.
     * 6. Redirects the player to the home page (or a specific URL) after a delay.
     */
    const gameOver = function () {
        $("html, body").animate({
            scrollTop: $("body").offset().top
        }, 1000)

        $("#game-over").css({
            visibility: "visible"
        });

        playSound("end-game")

        // setting the score in local storage
        const highest_score = global.score;
        settingToLocalStorage(highest_score);

        // display the user highest score sor far
        const highest_recorded_score = getFromLocalStorage();
        $("#game-over").append("<h1>Game Over</h1>");

        if (global.score > highest_recorded_score) {
            $("#game-over").append("<p>Wow! That is amazing; you have broken your record.</p>");
        } else if (global.score < 10) {
            $("#game-over").append(`<p>That is not a great score. I am sure you can get more than ${global.score}</p>`);
        } else if (global.score > 10 && global.score < 20) {
            $("#game-over").append(`<p>${global.score} is not bad. Keep trying I"m sure you can do better</p>`);
        } else {
            $("#game-over").append(`<p>${global.score} is a great effort, Keep trying</p>`);
        }

        $("#game-over").append(`<p>Your highest score so far is ${highest_recorded_score}</p>`);
        $("#game-over").append(`<p style="color: orange;">By Dean Lark</p>`);

        // set the score and all setting from above back to start game settings. Maybe put this in a function of its own
        global.score = 0;
        global.incorrect = 0;

        // Redirect the user back to index 
        setTimeout(function () {
            window.location.href = global.url;
            // window.location.href = "/";
        }, 4000);
    };

    /**
     * Handles the logic for switching between different pages based on the current URL path.
     * 
     * This function checks the value of `global.pathname` and performs specific actions based on the current page:
     * 1. If the current page is the home page ("/" or "/quizzy-msp2/"), it sets up event handlers for the settings button and sound button.
     * 2. If the current page is the game page ("/game.html" or "/quizzy-msp2/game.html"), it starts the game by calling `startGame()`.
     * 3. If the current page is not recognized, it logs an error message to the console.
     */
    const page_switch = function () {
        switch (global.pathname) {
            case "/":
            case "/quizzy-msp2/":
                $("#cog-icon").on("click", settings);
                $("#sound-btn").on("click", function () {
                    playSound("family-splash");

                    const sound = checkSoundEnabled()

                    if (sound === "true") {
                        setTimeout(function () {
                            window.location.href = "game.html"
                        }, 7000)
                    } else {
                        window.location.href = "game.html"
                    }
                });
                break;
            case "/game.html":
            case "/quizzy-msp2/game.html":
                startGame();  
                break;
            default:
                console.log("Something has gone wrong");
        }
    };

    page_switch();
});