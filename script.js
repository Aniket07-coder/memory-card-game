// ==============================
// SOUNDS
// ==============================

const bgMusic = new Audio("sounds/background.mp3");
const flipSound = new Audio("sounds/card-flip.mp3");
const successSound = new Audio("sounds/success-pop.mp3");
const errorSound = new Audio("sounds/error-click.mp3");
const winSound = new Audio("sounds/game-win.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.25;

flipSound.volume = 0.7;
successSound.volume = 0.7;
errorSound.volume = 0.7;
winSound.volume = 0.8;


// ==============================
// GAME VARIABLES
// ==============================

let gameEnabled = false;
let gameStarted = false;

let cards = [];

let firstCard = null;
let secondCard = null;

let lockBoard = false;

let moves = 0;
let matchedPairs = 0;

let timer = 0;
let timerInterval = null;

let currentDifficulty = "easy";


// ==============================
// BEST SCORES
// ==============================

let bestScores = {

    easy: localStorage.getItem("best_easy") || "--",

    medium: localStorage.getItem("best_medium") || "--",

    hard: localStorage.getItem("best_hard") || "--"

};


// ==============================
// CARD LIST
// ==============================

const easyCards = [

    "🍎","🍎",
    "🚗","🚗",
    "🐶","🐶",
    "⚽","⚽"

];

const mediumCards = [

    "🍎","🍎",
    "🚗","🚗",
    "🐶","🐶",
    "⚽","⚽",
    "🍕","🍕",
    "🎮","🎮"

];

const hardCards = [

    "🍎","🍎",
    "🚗","🚗",
    "🐶","🐶",
    "⚽","⚽",
    "🍕","🍕",
    "🎮","🎮",
    "🚀","🚀",
    "❤️","❤️"

];


// ==============================
// PAGE LOAD
// ==============================

$(document).ready(function(){

    $("#bestScore").text("--");

});


// ==============================
// START GAME
// ==============================

$("#startGameBtn").click(function(){

    const level = $("#difficulty").val();

    currentDifficulty = level;

    $("#bestScore").text(bestScores[currentDifficulty]);

    if(level === "easy"){

        cards = [...easyCards];

    }

    else if(level === "medium"){

        cards = [...mediumCards];

    }

    else{

        cards = [...hardCards];

    }

    cards.sort(()=>Math.random()-0.5);

    if(level=="easy"){

        $(".game-board").css("grid-template-columns","repeat(4,80px)");

    }

    else if(level=="medium"){

        $(".game-board").css("grid-template-columns","repeat(4,80px)");

    }

    else{

        $(".game-board").css("grid-template-columns","repeat(4,80px)");

    }

    createCards();

    gameEnabled = true;

    $("#startScreen").fadeOut(500);

    bgMusic.play();

});


// ==============================
// CREATE CARDS
// ==============================

function createCards(){

    $("#gameBoard").html("");

    cards.forEach(function(emoji){

        $("#gameBoard").append(`

        <div class="card-box" data-card="${emoji}">

            <div class="card-inner">

                <div class="front">

                    <i class="fa-solid fa-question"></i>

                </div>

                <div class="back">

                    ${emoji}

                </div>

            </div>

        </div>

        `);

    });

}



// ==============================
// CARD CLICK
// ==============================

$(document).on("click", ".card-box", function () {

    if (!gameEnabled) return;

    if (lockBoard) return;

    if ($(this).hasClass("flip")) return;

    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }

    $(this).addClass("flip");

    flipSound.currentTime = 0;
    flipSound.play();

    if (firstCard == null) {

        firstCard = $(this);

        return;

    }

    secondCard = $(this);

    moves++;

    $("#moves").text(moves);

    lockBoard = true;

    checkMatch();

});


// ==============================
// CHECK MATCH
// ==============================

function checkMatch() {

    if (firstCard.data("card") === secondCard.data("card")) {

        matchedPairs++;

        firstCard.addClass("matched");

        secondCard.addClass("matched");

        successSound.currentTime = 0;
        successSound.play();

        resetSelection();

        checkWin();

    }

    else {

        errorSound.currentTime = 0;
        errorSound.play();

        firstCard.addClass("shake");

        secondCard.addClass("shake");

        setTimeout(function () {

            firstCard.removeClass("shake flip");

            secondCard.removeClass("shake flip");

            resetSelection();

        }, 900);

    }

}


// ==============================
// RESET
// ==============================

function resetSelection() {

    firstCard = null;

    secondCard = null;

    lockBoard = false;

}


// ==============================
// TIMER
// ==============================

function startTimer() {

    clearInterval(timerInterval);

    timerInterval = setInterval(function () {

        timer++;

        let minutes = Math.floor(timer / 60);

        let seconds = timer % 60;

        minutes = minutes < 10 ? "0" + minutes : minutes;

        seconds = seconds < 10 ? "0" + seconds : seconds;

        $("#timer").text(minutes + ":" + seconds);

    }, 1000);

}


// ==============================
// WIN GAME
// ==============================

function checkWin() {

    if (matchedPairs !== cards.length / 2) return;

    clearInterval(timerInterval);

    if (
        bestScores[currentDifficulty] === "--" ||
        moves < Number(bestScores[currentDifficulty])
    ) {

        bestScores[currentDifficulty] = moves;

        localStorage.setItem("best_" + currentDifficulty, moves);

    }

    $("#bestScore").text(bestScores[currentDifficulty]);

    $("#finalDifficulty").text(
        currentDifficulty.charAt(0).toUpperCase() +
        currentDifficulty.slice(1)
    );

    $("#finalMoves").text(moves);

    $("#finalTime").text($("#timer").text());

    $("#finalBest").text(bestScores[currentDifficulty]);

    updateStarRating();

    fireConfetti();

    winSound.currentTime = 0;
    winSound.play();

    setTimeout(function () {

        const winModal = new bootstrap.Modal(
            document.getElementById("winModal")
        );

        winModal.show();

    }, 400);

}



// ==============================
// RESTART GAME
// ==============================

$("#restartBtn").click(function () {

    restartGame();

});


// ==============================
// PLAY AGAIN
// ==============================

$(document).on("click", "#playAgain", function () {

    const modal = bootstrap.Modal.getInstance(
        document.getElementById("winModal")
    );

    if (modal) {
        modal.hide();
    }

    restartGame();

});


// ==============================
// RESTART FUNCTION
// ==============================

function restartGame() {

    clearInterval(timerInterval);

    timer = 0;
    moves = 0;
    matchedPairs = 0;

    firstCard = null;
    secondCard = null;

    lockBoard = false;
    gameStarted = false;

    $("#timer").text("00:00");
    $("#moves").text("0");

    if (currentDifficulty === "easy") {

        cards = [...easyCards];

    }

    else if (currentDifficulty === "medium") {

        cards = [...mediumCards];

    }

    else {

        cards = [...hardCards];

    }

    cards.sort(() => Math.random() - 0.5);

    createCards();

}


// ==============================
// STAR RATING
// ==============================

function updateStarRating() {

    let stars = "";

    if (currentDifficulty === "easy") {

        if (moves <= 4)
            stars = "⭐⭐⭐";
        else if (moves <= 6)
            stars = "⭐⭐";
        else
            stars = "⭐";

    }

    else if (currentDifficulty === "medium") {

        if (moves <= 7)
            stars = "⭐⭐⭐";
        else if (moves <= 10)
            stars = "⭐⭐";
        else
            stars = "⭐";

    }

    else {

        if (moves <= 10)
            stars = "⭐⭐⭐";
        else if (moves <= 14)
            stars = "⭐⭐";
        else
            stars = "⭐";

    }

    $("#starRating").text(stars);

}


// ==============================
// STOP MUSIC WHEN PAGE CLOSES
// ==============================

$(window).on("beforeunload", function () {

    bgMusic.pause();
    bgMusic.currentTime = 0;

});


// ==============================
// KEYBOARD SHORTCUT
// ==============================

$(document).keydown(function (e) {

    if (e.key === "r" || e.key === "R") {

        restartGame();

    }

});


// ==============================
// GAME READY
// ==============================

console.log("✅ Memory Card Game Loaded Successfully");


// ==============================
// BACK BUTTON
// ==============================

$("#backBtn").click(function(){
    
    clearInterval(timerInterval);

    bgMusic.pause();
    bgMusic.currentTime = 0;

    gameEnabled = false;
    gameStarted = false;

    timer = 0;
    moves = 0;
    matchedPairs = 0;

    firstCard = null;
    secondCard = null;
    lockBoard = false;

    $("#timer").text("00:00");
    $("#moves").text("0");

    $("#gameBoard").html("");

    $("#startScreen").fadeIn(400);
});


function fireConfetti(){
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame(){
        confetti({
            particleCount:8,
            angle:60,
            spread:70,
            origin:{x:0}
        });

        confetti({
            particleCount:8,
            angle:120,
            spread:70,
            origin:{x:1}
        });

        confetti({
            particleCount:12,
            spread:120,
            origin:{y:0.7}
        });

        if(Date.now() < end){
            requestAnimationFrame(frame);
        }
    })();
}