$(document).ready(function() {
    const global = {
        url: '/',
        pathname: window.location.pathname,
        score: 0,
        incorrect: 0,
    }

    const play_sound = () => {
        $('#sound-btn').on('click', function () {
            clickSound.play()
            
            setTimeout(() => {
                window.location.href = 'game.html'
            }, 7000)     
        })
    }

    const fetch_data = async () => {
        try {
            const response = await fetch('https://the-trivia-api.com/api/questions?limit=1&difficulty=easy')
            const data = await response.json()

            return data
        } catch (error) {
            console.log('Error responce: ' + error)
        }   
    }

    const start_game = async () => {
        $('#score').text(global.score);

        // Reset the buttons to their default state
        // Using disabled, false allows the button to be clickable again
        $('.choice-btn').each(function() {
            $(this).css({
                background: '#fafafa',
                color: '#333'
            }).prop('disabled', false); // Re-enable buttons
        });

        const questions = await fetch_data()
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

        check_answer(correctAnswer)
    }

    const check_answer = (correctAnswer) => {
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

                show_incorrect_answer_crosses()                
            }
    
            // Wait for 3 seconds and then start a new game round
            setTimeout(() => {
                start_game();
            }, 3000); 
        });
    }

    const show_incorrect_answer_crosses = () => {
        const crossbox = $('.cross-box');
        
        if (global.incorrect < crossbox.length) {
            $(crossbox[global.incorrect]).css({
                visibility: 'visible'
            });
            // Increment incorrect count
            global.incorrect++;
        } 
    
        if (global.incorrect > 2) {
            console.log('Game Over');
    
            // Optionally, reset any visual indicators here
            $('.choice-btn').css({
                background: '#fafafa',
                color: '#333'
            });
    
            setTimeout(() => {
                $('.cross-box').css({
                    visibility: 'hidden'
                })
            }, 2000)

            setTimeout(() => {
                game_over()
            }, 3000)
            
        } 
    }

    const setting_to_storage = (score) => {
        let get_from_storage = getFromLocalStorage()

        if (score > get_from_storage) {
            localStorage.setItem('score', score)
        }
    }

    const getFromLocalStorage = () => {
        const result = JSON.parse(localStorage.getItem('score'))
        return result
    }

    const displayHighestScore = () => {
        const highestScore = getFromLocalStorage()
        $('#highest-score-so-far').append("Highest score " + "<span id='highestScore'>" + highestScore + "</span>")
    }

    const game_over = () => {
        // Get the div that is going to display the message
        $('#game-over').css({
            visibility: 'visible'
        })

        $('#end-game')[0].play()

        // display a message to the user saying well done and display the users score
        // $('#user_score').text(global.score)

        // setting the score in local storage
        const highest_score = global.score
        setting_to_storage(highest_score)

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

    const page_switch = () => {
        switch (global.pathname) {
            case '/quizzy-msp2/':
                play_sound()
            break;
            case '/quizzy-msp2/game.html':
                start_game()
                displayHighestScore()
            break;
            default:
                console.log('Something has gone wrong')
        }
    }

    page_switch()
})