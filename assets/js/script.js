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
    }

    const page_switch = () => {
        switch (global.pathname) {
            case '/':
                play_sound()
            break;
            case '/game.html':
                start_game()
            break;
            default:
                console.log('Something has gone wrong')
        }
    }

    page_switch()
})