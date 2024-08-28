$(document).ready(function() {
    const global = {
        url: window.href === '/' ? 'localhost:8000' : 'https://deanophp.github.io/quizzy-msp2/',
        pathname: window.location.pathname,
        score: 0,
        incorrect: 0,
    }

    /**
     * Comment out here
     */
    const effect = () => {
        $('#title').effect('shake', { direction: 'left', times: 8, distance: 20 }, 7000)
    }

    /**
     * give comment
     */
    const playSound = () => {
        $('#sound-btn').on('click', function () {
            clickSound.play()
            
            setTimeout(() => {
                window.location.href = 'game.html'
            }, 7000)     
        })
    }

    /**
     * 
     * @returns 
     */
    const fetchData = async () => {
        try {
            const response = await fetch('https://the-trivia-api.com/api/questions?limit=1&difficulty=easy')
            const data = await response.json()

            return data
        } catch (error) {
            console.log('Error responce: ' + error)
        }   
    }

    /**
     * Give comments
     */
    const startGame = async () => {
        $('#score').text(global.score);

        // Reset the buttons to their default state
        // Using disabled, false allows the button to be clickable again
        $('.choice-btn').each(function() {
            $(this).css({
                background: '#fafafa',
                color: '#333'
            }).prop('disabled', false); // Re-enable buttons
        });

        const questions = await fetchData()
        console.log(questions)
        $('#question-area').text(questions[0].question)

        const incorrectAnswers = questions[0].incorrectAnswers
        const correctAnswer = questions[0].correctAnswer
        const allAnswers = [...incorrectAnswers, correctAnswer]
        
        // Shuffle allAnsers 
        allAnswers.sort(() => Math.random() - 0.5)
        
        // Store the answers inside the each choice-btn class
        $('.choice-btn').each(function(index) {
            if (index < allAnswers.length) {
                $(this).text(allAnswers[index])
            }
        })

        checkAnswers(correctAnswer)
    }

    /**
     * 
     * @param {*} correctAnswer 
     */
    const checkAnswers = (correctAnswer) => {
        // .off('click') removes any existing click events
        // .on('click') attaches a new event to the btn
        // .prop('disabled': true) means the button is disabled
        $('.choice-btn').off('click').on('click', function() {

            $('.choice-btn').off('click').prop('disabled', true);
    
            if ($(this).text() === correctAnswer) {
                $(this).css({
                    background: 'green',
                    color: '#fafafa'
                });
    
                correctSound.play();

                global.score++
            } else {
                $(this).css({
                    background: 'red',
                    color: '#fafafa'
                });

                // Highlight the correct answer
                setTimeout(() => {
                    $('.choice-btn').each(function(index, ans) {
                        if ($(ans).text() === correctAnswer) {
                            $(ans).css({
                                background: 'green',
                                color: '#fafafa'
                            });
                        }
                    });
                }, 1000);
                
                incorrectSound.play();

                showIncorrectAnswers()   
                
                // When the user gets the question wrong I want to make sure the user sees that they have lost a life so I have used smooth animation to direct them to the lost life area.
                $('html, body').animate({
                    scrollTop: $('#three-incorrect-answers-crosses').offset().top
                }, 1000);                  
            }
    
            // Wait for 3 seconds and then start a new game round
            setTimeout(() => {
                startGame();
            }, 3000); 
        });
    }

    /**
     * Give comments
     */
    const showIncorrectAnswers = () => {
        const crossbox = $('.cross-box');
        
        if (global.incorrect < crossbox.length) {
            $(crossbox[global.incorrect]).css({
                visibility: 'visible'
            });
            // Increment incorrect count
            global.incorrect++;
        } 
    
        if (global.incorrect > 2) {
            setTimeout(() => {
                $('.cross-box').css({
                    visibility: 'hidden'
                })
            }, 2000)

            setTimeout(() => {
                gameOver()
            }, 3000)          
        } 
    }

    /**
     * 
     * @param {number} score 
     */
    const settingToLocalStorage = (score) => {
        let getFromStorage = getFromLocalStorage()

        if (score > getFromStorage) {
            localStorage.setItem('score', score)
        }
    }

    /**
     * 
     * @returns 
     */
    const getFromLocalStorage = () => {
        const result = JSON.parse(localStorage.getItem('score'))
        return result
    }

    const resetScore = () => {
        $('#resetScore').on('click', function() {
            // put a check alert here to see whether user wants to reset and if so let them know the game will also restart
            if (confirm('Are you sure you want to reset your highest score? ')) { 
                localStorage.removeItem('score')
                $('#highestScore').text('0')
            }
        })
    }

    /**
     * Give comment
     */
    const displayHighestScore = () => {
        const highestScore = getFromLocalStorage()

        $('#highest-score-so-far').append("Highest score " + "<span id='highestScore'>" + (highestScore == null ? 0 : highestScore) + "</span>")
    }

    /**
     *  Comment here
     */
    const gameOver = () => {
        // Get the div that is going to display the message
        $('#game-over').css({
            visibility: 'visible'
        })

        $('#end-game')[0].play()

        // display a message to the user saying well done and display the users score
        // $('#user_score').text(global.score)

        // setting the score in local storage
        const highest_score = global.score
        settingToLocalStorage(highest_score)

        // display the user highest score sor far
        const highest_recorded_score = getFromLocalStorage()
        $('#game-over').append('<h1>Game Over</h1>')

        if (global.score > highest_recorded_score) {
            $('#game-over').append('<p>Whoop Whoop you have broke your record</p>')
            // Add some graphics and music video 
        } else if (global.score < 10) {
            $('#game-over').append(`<p>A Monkey could do better than ${global.score}</p>`)
        } else if (global.score > 10 && global.score < 20) {
            $('#game-over').append(`<p>${global.score} is not bad. Keep trying I'm sure you can do better</p>`)
        } else {
            $('#game-over').append(`<p>${global.score} is a great effort</p>`)
        }

        $('#game-over').append(`<p>Your highest score so far is ${highest_recorded_score}</p>`)
        $('#game-over').append(`<p>By Dean Lark</p>`)
        
        // set the score and all setting from above back to start game settings. Maybe put this in a function of its own
        global.score = 0
        global.incorrect = 0;

        // Redirect the user back to index 
        setTimeout(() => {
            window.location.href = global.url
        }, 4000)
    }

    /**
     * Comments here
     */
    const page_switch = () => {
        switch (global.pathname) {
            case '/':
            case '/quizzy-msp2/':
                effect()
                playSound()
            break;
            case '/game.html':
            case '/quizzy-msp2/game.html':
                startGame()
                displayHighestScore()
                resetScore()
            break;
            default:
                console.log('Something has gone wrong')
        }
    }

    page_switch()
})