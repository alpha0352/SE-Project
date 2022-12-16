// Countdown timer for redirecting to another URL after several seconds
var seconds = 5; // seconds for HTML
var foo; // variable for clearInterval() function

function redirect() {
    document.location.href = 'http://localhost:3000/users/home';
}

function updateSecs() {
    document.getElementById("seconds").innerHTML = seconds;
    seconds--;
    if (seconds == -1) {
        clearInterval(foo);
        redirect();
    }
}

function countdownTimer() {
    foo = setInterval(function () {
        updateSecs()
    }, 1000);
}

countdownTimer();