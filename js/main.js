let VOTING_DURATION = 3; // in seconds
let isPaused = false;

// ============================================
// GAME DATA
// ============================================

const gameData = {

    // == Kid round ==
    start: {
        entryVideo: "assets/kid_entrance.mp4",
        walkVideo: "assets/kid_running.mp4",
        options: [
            {
                id: 'a',
                text: "Path of Information",
                resultVideo: "assets/studious_kid_events.webm",
                nextRound: "knowledge_path"
            },
            {
                id: 'b',
                text: "Path of Connection",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "connection_path"
            },
            {
                id: 'c',
                text: "Path of Expression",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "expression_path"
            }
        ]
    },

    // == Studious teen round ==
    knowledge_path: {
        entryVideo: "assets/studious_teen_walk.mp4",
        walkVideo: "assets/studious_teen_walk.mp4",
        options: [
            {
                id: 'a',
                text: "Path of Excellence",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "end"
            },
            {
                id: 'b',
                text: "Path of Finance",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "end"
            },
            {
                id: 'c',
                text: "Path of Pursuit",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "end"
            }
        ]
    },

    // == Social teen round ==
    connection_path: {
        entryVideo: "assets/socialite_teen_walk.mp4",
        walkVideo: "assets/socialite_teen_walk.mp4",
        options: [
            {
                id: 'a',
                text: "Path of Community",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "end"
            },
            {
                id: 'b',
                text: "Path of Exploration",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "end"
            },
            {
                id: 'c',
                text: "Path of Performance",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "end"
            }
        ]
    },

    // == Artsy teen round ==
    expression_path: {
        entryVideo: "assets/artsy_teen_walk.mp4",
        walkVideo: "assets/artsy_teen_walk.mp4",
        options: [
            {
                id: 'a',
                text: "Path of ",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "end"
            },
            {
                id: 'b',
                text: "Path of ",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "end"
            },
            {
                id: 'c',
                text: "Path of ",
                resultVideo: "assets/studious_kid_animation.mp4",
                nextRound: "end"
            }
        ]
    }
};

// ============================================
// GAME STATE
// ============================================

let currentRound = 'start';
let votes = { a: 0, b: 0, c: 0 };
let timeRemaining = VOTING_DURATION;
let timerInterval = null;
let isVoting = false;

// ============================================
// DOM ELEMENTS
// ============================================

const videoA = document.getElementById('videoA');
const videoB = document.getElementById('videoB');
const eventVideo = document.getElementById('eventVideo');
const whiteFade = document.getElementById('whiteFade');
let currentVideo = videoA;
let nextVideo = videoB;

const pauseButton = document.getElementById('pauseButton');
const votingSection = document.getElementById('votingSection');
const timerDisplay = document.getElementById('timer');
const statusMessage = document.getElementById('statusMessage');
const buttonA = document.getElementById('buttonA');
const buttonB = document.getElementById('buttonB');
const buttonC = document.getElementById('buttonC');

// ============================================
// PAUSE BUTTON
// ============================================

function togglePause() {
    isPaused = !isPaused;

    if (isPaused) {
        // Pause everything
        clearInterval(timerInterval);
        eventVideo.pause();
        document.getElementById('pauseButton').textContent = '\u23F5';
    } else {
        // Resume everything
        currentVideo.play();
        eventVideo.play();

        if (isVoting) {
            // Resume timer
            timerInterval = setInterval(function () {
                timeRemaining--;
                timerDisplay.textContent = timeRemaining;
                if (timeRemaining <= 0) {
                    endVoting();
                }
            }, 1000);
        }

        document.getElementById('pauseButton').textContent = "\u23F8";
    }
}

// ============================================
// VIDEOS AND BUTTONS
// ============================================

function swapVideos(videoPath, shouldLoop, onEndedCallback = null) {
    nextVideo.src = videoPath;
    nextVideo.loop = shouldLoop;
    nextVideo.load();

    nextVideo.oncanplaythrough = function () {
        nextVideo.oncanplaythrough = null;
        nextVideo.play();

        currentVideo.classList.remove('active');
        nextVideo.classList.add('active');

        const temp = currentVideo;
        currentVideo = nextVideo;
        nextVideo = temp;

        if (onEndedCallback) {
            currentVideo.onended = onEndedCallback;
        }
    };
}

function playEventVideo(videoPath, isEnding, nearEnd, onComplete) {
    eventVideo.src = videoPath;
    eventVideo.load();

    eventVideo.oncanplaythrough = function () {
        eventVideo.oncanplaythrough = null;
        eventVideo.classList.remove('hidden');
        eventVideo.play();
    };

    eventVideo.ontimeupdate = function () {
        const timeLeft = eventVideo.duration - eventVideo.currentTime;

        if (timeLeft <= 2) {
            eventVideo.ontimeupdate = null;
            if (nearEnd) nearEnd();
        }
    }

    eventVideo.onended = function () {
        if (!isEnding) {
            eventVideo.classList.add('hidden');
        }
        if (onComplete) onComplete();
    };
}

function updateButtonLabels() {
    const options = gameData[currentRound].options;
    buttonA.textContent = options[0].text;
    buttonB.textContent = options[1].text;
    buttonC.textContent = options[2].text;
}

function updateVoteCounts() {
    document.getElementById('countA').textContent = votes.a;
    document.getElementById('countB').textContent = votes.b;
    document.getElementById('countC').textContent = votes.c;
}

// ============================================
// GAME FLOW
// ============================================

function startWalkingPhase() {
    votingSection.classList.add('hidden');
    pauseButton.classList.add('hidden');
    statusMessage.textContent = '';

    const roundData = gameData[currentRound];

    swapVideos(roundData.entryVideo, false, function () {
        swapVideos(roundData.walkVideo, true);
        setTimeout(startVoting, 3000);
    });
}

function startVoting() {
    if (isPaused) return;

    isVoting = true;
    votes = { a: 0, b: 0, c: 0 }; // Reset votes
    timeRemaining = VOTING_DURATION;

    votingSection.classList.remove('hidden');
    pauseButton.classList.remove('hidden');
    updateButtonLabels();
    updateVoteCounts();
    statusMessage.textContent = 'Voting...';

    timerDisplay.textContent = timeRemaining;
    timerInterval = setInterval(function () {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;

        if (timeRemaining <= 0) {
            endVoting();
        }
    }, 1000);
}

function vote(optionId) {
    if (isPaused) return;
    if (!isVoting) return;
    votes[optionId]++;
    updateVoteCounts();
}

function endVoting() {
    isVoting = false;
    clearInterval(timerInterval);

    let winner = 'a';
    if (votes.b > votes[winner]) winner = 'b';
    if (votes.c > votes[winner]) winner = 'c';

    const winningOption = gameData[currentRound].options.find(opt => opt.id === winner);

    statusMessage.textContent = `${winningOption.text} wins with ${votes[winner]} votes!`;

    setTimeout(function () {
        playResultScene(winningOption);
    }, 2000);
}

function playResultScene(winningOption) {
    votingSection.classList.add('hidden');
    pauseButton.classList.add('hidden');

    const isEnding = (winningOption.nextRound === 'end');

    const nearVideoEnd = function () {
        if (winningOption.nextRound !== 'end') {
            const nextRoundData = gameData[winningOption.nextRound];
            swapVideos(nextRoundData.entryVideo, false, function () {
                swapVideos(nextRoundData.walkVideo, true);
            });
        }
    }

    const ending = function () {
        if (winningOption.nextRound === 'end') {
            whiteFade.classList.add('active');

            setTimeout(function () {
                eventVideo.classList.add('hidden');
                whiteFade.classList.remove('active');
                currentRound = 'start';
                startWalkingPhase();
            }, 3000); // 3 seconds of white
        } else {
            currentRound = winningOption.nextRound;
            setTimeout(startVoting, 3000);
        }
    };

    playEventVideo(winningOption.resultVideo, isEnding, nearVideoEnd, ending);
}

startWalkingPhase();