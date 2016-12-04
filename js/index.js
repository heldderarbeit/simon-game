/* a memory game for firefox, chromium and safari with sounds generated using the Web Audio API */

var gameMemory = {
  boardIsOn: false,
  roundNo: 0,
  maxRounds: 15,
  // prevents putting the game starting function in a queue
  startActive: false,
  colorSequence: [],
  // accepts user input
  waitForInput: false,
  indexInColorSequence: 0,
  strictMode: false,
  gameWon: false,
  thisRoundSolved: false,
  timeLimit: 18000,
  counterTimeout: undefined,
  lightTimeout: undefined,
  
  btn1color: "#00A74A",
  btn2color: "#9F0F17",
  btn3color: "#CCA707",
  btn4color: "#094A8F",
  brightcolor1: "#4DF497",
  brightcolor2: "#EC5C64",
  brightcolor3: "#FFF454",
  brightcolor4: "#5697DC",
  
  // middle C (C4)
  btn1frequency: 261.63,
  // A4
  btn2frequency: 220,
  // G3
  btn3frequency: 196,
  // D4
  btn4frequency: 293.66,
  
  lvl1speed: 900,
  lvl2speed: 700,
  lvl3speed: 500,
  lvl4speed: 300
};

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioCtx = new AudioContext();

function getRandomInteger(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
};

function resetMemory() {
  gameMemory.roundNo = 0;
  gameMemory.startActive = false;
  gameMemory.colorSequence = [];
  gameMemory.waitForInput = false;
  gameMemory.indexInColorSequence = 0;
  gameMemory.gameWon = false;
  gameMemory.thisRoundSolved = false;
  gameMemory.timeLimit = 18000;
  gameMemory.counterTimeout = undefined;
  gameMemory.lightTimeout = undefined;
};

function resetGame() {
  $("#led").text("--");
  resetMemory();
};

function startGame() {
  if (!gameMemory.startActive) {
    gameMemory.startActive = true;
    resetGame();
    prepareNewRound();
  }
};

function turnOn() {
  $("#led").addClass("ledOn").removeClass("ledOff");
  gameMemory.boardIsOn = true;
  playStartUpSound();
};

function turnOff() {
  resetGame();
  $("#led").removeClass("ledOn").addClass("ledOff");
  gameMemory.boardIsOn = false;
  turnStrictLedOff();
  $(".quarter-btn").removeClass("pointercursor");
  gameMemory.strictMode = false;
};

function turnStrictLedOff() {
  $("#control-led").removeClass("control-led-on").addClass("control-led-off");
};

function turnStrictLedOn() {
  $("#control-led").removeClass("control-led-off").addClass("control-led-on");
};

function displayWarning() {
  $("#led").text("!!");
};

function displayVictory() {
  $("#led").text("**");
};

function blinkLed() {
  $("#led").delay(250).fadeOut(75).fadeIn(150);
};

function blinkLedTwoTimesAndWait() {
  blinkLed();
  blinkLed();
  $("#led").delay(500);
};

function setAndDisplayNewRound() {
  if (parseInt(gameMemory.roundNo) < gameMemory.maxRounds) {
    gameMemory.roundNo = parseInt(gameMemory.roundNo) + 1;
    // prepends zero to one-digit numbers
    if (0 <= gameMemory.roundNo && gameMemory.roundNo <= 9) {
      gameMemory.roundNo = "0" + gameMemory.roundNo;
    }
    $("#led").text(gameMemory.roundNo);
  } else {
    displayVictory();
    resetMemory();
    gameMemory.boardIsOn = false;
    gameMemory.gameWon = true;
  }
};

function displayRoundAgain() {
  gameMemory.roundNo = parseInt(gameMemory.roundNo);
  // prepends zero to one-digit numbers
  if (0 <= gameMemory.roundNo && gameMemory.roundNo <= 9) {
    gameMemory.roundNo = "0" + gameMemory.roundNo;
  }
  $("#led").text(gameMemory.roundNo);
};

function repeatRound() {
  gameMemory.startActive = true;
  blinkLedTwoTimesAndWait();
  // waits until led has finished blinking
  $("#led").promise().done(function() {
    if (gameMemory.boardIsOn) {
      displayRoundAgain();
      gameMemory.startActive = false;
      lightColorButtons(gameMemory.colorSequence, 0);
    }
  });
};

function prepareNewRound() {
  gameMemory.startActive = true;
  blinkLedTwoTimesAndWait();
  // waits until led has finished blinking
  $("#led").promise().done(function() {
    if (gameMemory.boardIsOn) {
      gameMemory.indexInColorSequence = 0;
      setAndDisplayNewRound();
      gameMemory.startActive = false;
      gameMemory.colorSequence.push(getRandomInteger(1, 4));
      lightColorButtons(gameMemory.colorSequence, 0);
    }
  });
};

function playStartUpSound() {
  playSound(220.00, 0, 0.3);
  playSound(293.66, 0.3, 1);
};

function playSound(frequencyValue, start, duration) {
  // create oscillator node from web audio api context
  var oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.connect(audioCtx.destination);
  // value in hertz  
  oscillator.frequency.value = frequencyValue;
  if (start) {
    oscillator.start(start + audioCtx.currentTime);
  } else {
    oscillator.start(0 + audioCtx.currentTime);
  }
  if (duration) {
    oscillator.stop(duration + audioCtx.currentTime);
  } else {
    oscillator.stop(0.75 + audioCtx.currentTime);
  }
};

function getLightSpeed() {
  if (gameMemory.roundNo > 0 && gameMemory.roundNo < 5) {
    return gameMemory.lvl1speed;
  } else if (gameMemory.roundNo >= 5 && gameMemory.roundNo < 9) {
    return gameMemory.lvl2speed;
  } else if (gameMemory.roundNo >= 9 && gameMemory.roundNo < 13) {
    return gameMemory.lvl3speed;
  } else if (gameMemory.roundNo >= 13) {
    return gameMemory.lvl4speed;
  }
};

function lightColorButtons(arr, index) {
  window.clearTimeout(gameMemory.lightTimeout);
  
  if (gameMemory.boardIsOn) {
    gameMemory.thisRoundSolved = false;
    var colorsToShow = arr;
    
    if (index < colorsToShow.length) {
      var number = colorsToShow[index];
      var brightColor = gameMemory["brightcolor" + number];
      var origColor = gameMemory["btn" + number + "color"];
      var targetBtn = ".btns .quarter-btn:nth-child(" + number + ")";
      $(targetBtn).css("background-color", brightColor);
      var audioString = "btn" + number + "frequency";
      playSound(gameMemory[audioString]);
      var lightSpeed = getLightSpeed();
      
      gameMemory.lightTimeout = window.setTimeout(function() {
        $(targetBtn).css("background-color", origColor);
        
        window.setTimeout(function() {
          index += 1;
          lightColorButtons(colorsToShow, index);
        }, lightSpeed);
      }, lightSpeed);
      
      // last index reached
      if (index === colorsToShow.length - 1) {
        gameMemory.waitForInput = true;
        $(".quarter-btn").addClass("pointercursor");
        // implements time limit for the color sequence
        
        gameMemory.counterTimeout = window.setTimeout(function() {
          if (!gameMemory.thisRoundSolved && gameMemory.boardIsOn) {
            gameMemory.indexInColorSequence = 0;
            displayWarning();
            gameMemory.waitForInput = false;
            $(".quarter-btn").removeClass("pointercursor");
            if (!gameMemory.strictMode) {
              repeatRound();
            } else {
              startGame();
            }
          }
        }, gameMemory.timeLimit);
      }
    }
  }
};

$("#start-btn").click(function() {
  if (gameMemory.boardIsOn || gameMemory.gameWon) {
    gameMemory.boardIsOn = true;
    startGame();
  }
});

$("#strict-btn").click(function() {
  if (gameMemory.boardIsOn || gameMemory.gameWon) {
    gameMemory.strictMode = !gameMemory.strictMode;
    if (gameMemory.strictMode) {
      turnStrictLedOn();
    } else {
      turnStrictLedOff();
    }
  }
});

$("#switch-id").click(function() {
  if (!gameMemory.gameWon) {
    gameMemory.boardIsOn = !gameMemory.boardIsOn;
  }
  if (gameMemory.boardIsOn) {
    turnOn();
  } else {
    turnOff();
  }
});

$(".quarter-btn").click(function() {
  if (gameMemory.waitForInput) {
    gameMemory.waitForInput = false;
    $(".quarter-btn").removeClass("pointercursor");
    var pressedColor = $(this).attr("id");
    var numberColor;
    
    switch (pressedColor) {
      case "greenBtn":
        numberColor = 1;
        break;
      case "redBtn":
        numberColor = 2;
        break;
      case "yellowBtn":
        numberColor = 3;
        break;
      case "blueBtn":
        numberColor = 4;
        break;
      default:
        break;
    }
    
    var audioString = "btn" + numberColor + "frequency";
    playSound(gameMemory[audioString]);
    var brightColor = gameMemory["brightcolor" + numberColor];
    var origColor = gameMemory["btn" + numberColor + "color"];
   
    // lights the color buttons on click
    $(this).css("background-color", brightColor);
    $(this).delay(200).queue(function() {
      $(this).css("background-color", origColor);
      $(this).dequeue();
    });
    
    var i = gameMemory.indexInColorSequence;
    if (numberColor === gameMemory.colorSequence[i]) {
      if (gameMemory.indexInColorSequence === gameMemory.colorSequence.length - 1) {
        gameMemory.thisRoundSolved = true;
        window.clearTimeout(gameMemory.counterTimeout);
        prepareNewRound();
      } else {
        gameMemory.indexInColorSequence++;
        /* sets the color pieces clickable again */
        var clickSpeed = 700;
        
        window.setTimeout(function() {
          gameMemory.waitForInput = true;
          $(".quarter-btn").addClass("pointercursor");
        }, clickSpeed);
      }
    } else {
      gameMemory.indexInColorSequence = 0;
      displayWarning();
      window.clearTimeout(gameMemory.counterTimeout);
      gameMemory.counterTimeout = undefined;
      
      if (!gameMemory.strictMode) {
        repeatRound();
      } else {
        startGame();
      }
    }
  }
});
