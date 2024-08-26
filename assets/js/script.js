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