// ***** JavaScript Code *****

// Declare Global variables
let tableNumber = 99;
let score = 0;
let attempts = 0;
let state = true;
let firstNum = 89;
let time = 180;
let countdownToStartSeconds = 3;
let countdownToNextTimedTest;
let secondsBetweenTests = 43200;
let testDateEnd;
let nextTestStart;
let gameRunning = true;
let quit = false;
let isTimedGame = false;
let timer;
let timer2;
let animTimer;
let num = 0;
let isRandomTables = false;
let previousRandomNumber = 0;
let db = null;
let recordScore = 0;
let recordCount = 0;
let createBonus = 0;
let rewardRecordCount = 0;
let getRecordsUpdateScore = true;

let currentDateTime = Date.parse(new Date()) / 1000;

let isCountdownToNextTestTimer = false;

// Boolean for testing purposes - disables the countdown to next test - TO REMOVE
let isCountdownToNextTestTimerWorking = true;

// DOM Elements
const mainContainer = document.querySelector("#container");
const gameHeader = document.querySelector("#gameHeader");
const showSavedResults = document.querySelector("#showSavedResults");
const timerDisplay = document.querySelector("#timerDisplay");
const scoreDisplay = document.querySelector("#score");
const userTries = document.querySelector("#attempts");
const submitBtn = document.querySelector("#btn");
const userAnswerTextBox = document.querySelector("#userAnswerTextBox");
const freeFlowBtn = document.querySelector("#freeFlowBtn");
const timedTestBtn = document.querySelector("#timedTestBtn");
const startButton = document.querySelector("#startBtn");
const countdownToStart = document.querySelector("#countdownToStart");
const countdownToStartDiv = document.querySelector(".countdownToStart");
const defaultGame = document.querySelector("#defaultTest");
const numSelect = document.querySelector("#numSelect");
const numberChoiceScreen = document.querySelector("#chooseNumber");
const backToMenuBtn = document.querySelectorAll(".backToMenuBtn");
const resultTextArea = document.querySelector("#textAreaResults");
const resultMessage = document.querySelector("#result");
const rewardColouredBar = document.querySelector("#rewardColouredBar");
const smallIcon = document.querySelector("#smallIcon");
const smallIcon2 = document.querySelector("#smallIcon2");
const smallIcon3 = document.querySelector("#smallIcon3");
const biggerIcon = document.querySelector("#biggerIcon");
const vBucksIcon = document.querySelector("#vBucksIcon");
const showRewardDiv = document.querySelector("#showRewardDiv");
const overlay = document.querySelector("#overlay");
const hoursToNextTestElement = document.querySelector("#hours");
const minutesToNextTestElement = document.querySelector("#minutes");
const secondsToNextTestElement = document.querySelector("#seconds");
const countdownToNextTestSubContainer = document.querySelector(
  "#countdownToNextTestSubContainer"
);

// created elements
const percent = document.createElement("h1");
percent.style.fontSize = "400%";
percent.classList = "my-3";

// *************************************************
// ************  Event Listeners  ******************
// *************************************************

var modals = document.getElementsByClassName("backToMenuBtn");
for (var i = 0; i < modals.length; i++) {
  modals[i].addEventListener("click", function() {
    location.reload();
  });
}

userAnswerTextBox.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    submitBtn.click();
  }
});

submitBtn.addEventListener("click", function(event) {
  event.preventDefault();
  calcAnswer();
});

freeFlowBtn.addEventListener("click", function() {
  let menu = document.getElementById("mainMenu");
  menu.style.display = "none";
  numberChoiceScreen.style.display = "block";
});

timedTestBtn.addEventListener("click", function() {
  let menu = document.getElementById("mainMenu");
  menu.style.display = "none";
  isTimedGame = true;
  isRandomTables = true;
  tableNumber = numSelect.value;
  defaultGame.style.display = "block";
  gameHeader.innerHTML = "3 Minute<br>Tables Test";
  countdownToStart.innerHTML = 3;
  timerDisplay.innerHTML = "Remaining Time:";
  showSum();
  resetUserInputBox();
  // delay start of test until 3 second countdown is done
  setTimeout(timeLimitTest, 3000);
  // begin countdown to test start
  countdownToStartTimer = setInterval(countdownToStartFunction, 1000);
});

startButton.addEventListener("click", function() {
  if (numSelect.value === "All") {
    isRandomTables = true;
  }
  tableNumber = numSelect.value;
  numberChoiceScreen.style.display = "none";
  countdownToStartDiv.style.display = "none";
  defaultGame.style.display = "block";
  gameHeader.innerHTML = "Free Practise";

  showSum();
  resetUserInputBox();
});

showSavedResults.addEventListener("click", function() {
  if (resultTextArea.style.display === "block") {
    resultTextArea.style.display = "none";
  } else {
    resultTextArea.style.display = "block";
  }
  getRecordsUpdateScore = false;
  getTestResults();
});

// *************************************************
// **************** PROGRAM START ******************
// *************************************************
// create database then load user records using callback
createDB(get_record, get_reward_status_record);

// *********************************************************************************************
// ********* Boolean for testing purposes - disables the countdown to next test -
//  REMOVE IF STATEMENT!!! ///*******************************************************************************************
if (isCountdownToNextTestTimerWorking) {
  countdownToNextTestTimer = setInterval(countdownToTimedTest, 1000);
}

// *************************************************
// **************** FUNCTIONS **********************
// *************************************************

function createDB(callback1, callback2) {
  let request = indexedDB.open("TimesTableDB");
  request.onerror = function(event) {
    console.log("Problem opening database");
  };

  request.onupgradeneeded = function(event) {
    db = event.target.result;
    let scoreObjectStore = db.createObjectStore("gameResults", {
      keyPath: "datetime"
    });
    scoreObjectStore.transaction.oncomplete = function(event) {
      console.log("scoreObjectStore Created");
    };

    // create 2nd object Store
    let rewardStatusObjectStore = db.createObjectStore("rewardStatus", {
      keyPath: "name"
    });
    rewardStatusObjectStore.transaction.oncomplete = function(event) {
      console.log("rewardStatusObjectStore Created");
    };
  };

  request.onsuccess = function(event) {
    db = event.target.result;
    console.log("DB Opened");
    //insert_records(score);
    db.onerror = function(event) {
      console.log("Failed to open db");
    };
    //get records using callback
    callback1();
    callback2();
  };
}

// **********************************************************************************************************

function insert_records(records, storeName) {
  if (db) {
    const insert_transaction = db.transaction(storeName, "readwrite");
    const scoreObjectStore = insert_transaction.objectStore(storeName);
    insert_transaction.oncomplete = function() {
      console.log("ALL INSERT TRANSACTIONS COMPLETE.");
    };
    insert_transaction.onerror = function() {
      console.log("PROBLEM INSERTING RECORDS.");
    };
    for (const gameScore of records) {
      let request = scoreObjectStore.add(gameScore);
      request.onsuccess = function() {
        console.log("Added: ", gameScore);
      };
    }
  }
}

// ******************************************************************************************************

function getTestResults() {
  if (db) {
    const get_transaction = db.transaction("gameResults", "readonly");
    const objectStore = get_transaction.objectStore("gameResults");
    get_transaction.oncomplete = function() {
      console.log("ALL GET TRANSACTIONS COMPLETE.");
      //return recordScore;
    };
    get_transaction.onerror = function() {
      console.log("PROBLEM GETTING RECORDS.");
    };

    let request = objectStore.getAll();
    let objectStoreCount = objectStore.count();
    objectStoreCount.onsuccess = function() {
      recordCount = objectStoreCount.result;
      console.log("get_record Count " + recordCount);
      console.log("get_reward_record Count " + rewardRecordCount);
    };
    request.onsuccess = function(event) {
      // Call function which displays results in textarea
      displayResults(event.target.result);
    };
  } // end if
} // end function

//****************************************************************************************

function get_record() {
  if (db) {
    const get_transaction = db.transaction("gameResults", "readonly");
    const objectStore = get_transaction.objectStore("gameResults");
    get_transaction.oncomplete = function() {
      console.log("ALL GET TRANSACTIONS COMPLETE.");
      //return recordScore;
    };
    get_transaction.onerror = function() {
      console.log("PROBLEM GETTING RECORDS.");
    };

    let request = objectStore.getAll();
    let objectStoreCount = objectStore.count();
    objectStoreCount.onsuccess = function() {
      recordCount = objectStoreCount.result;
      console.log("get_record Count " + recordCount);
      console.log("get_reward_record Count " + rewardRecordCount);
    };

    request.onsuccess = function(event) {
      // Call function which displays results in textarea
      //displayResults(event.target.result);

      setTimeout(() => {
        if (getRecordsUpdateScore === true) {
          for (let i = 0; i < recordCount; i++) {
            recordScore += event.target.result[i].score;
          } // end forLoop
        } // end if
        console.log("RecordScore = " + recordScore);
        //
        console.log("curentDateTime: " + currentDateTime);
        // get date from most recent record - convert to unix timestamp
        testDateEnd =
          Date.parse(event.target.result[recordCount - 1].datetime) / 1000;
        console.log("start time is: " + testDateEnd);
        nextTestStart = testDateEnd + secondsBetweenTests;
        console.log("next test time: " + nextTestStart);
        countdownToNextTimedTest = nextTestStart - currentDateTime;

        // update reward progress bars with new values
        displayValuesInRewardProgessBars();
      }, 500);
    };
  } else {
    console.log("not set");
  }
}

//****************************************************************************************

function get_reward_status_record() {
  if (db) {
    const get_transaction = db.transaction("rewardStatus", "readonly");
    const objectStore = get_transaction.objectStore("rewardStatus");
    get_transaction.oncomplete = function() {
      console.log("ALL rewardStatus COMPLETE.");
    };
    get_transaction.onerror = function() {
      console.log("PROBLEM GETTING rewardStatus RECORDS.");
    };

    let request = objectStore.getAll();
    let objectStoreCount = objectStore.count();
    objectStoreCount.onsuccess = function() {
      rewardRecordCount = objectStoreCount.result;
      console.log("get_reward_record Count 2 " + rewardRecordCount);
      if (rewardRecordCount > 0) smallIcon.style.opacity = 0.3;
      if (rewardRecordCount > 1) smallIcon2.style.opacity = 0.3;
      if (rewardRecordCount > 2) smallIcon3.style.opacity = 0.3;
      if (rewardRecordCount > 3) biggerIcon.style.opacity = 0.3;
      if (rewardRecordCount > 4) vBucksIcon.style.opacity = 0.3;
    };

    request.onsuccess = function(event) {};
  } else {
    console.log("not set");
  }
}

// ***************************************************************************************

function displayValuesInRewardProgessBars() {
  //console.log("inside displayValuesInRewardProgressBars: " + isFirstRewardCollected);
  if (recordScore < 100000) {
    rewardColouredBar.style.width = recordScore / 1000 + "%";
  } else {
    rewardColouredBar.style.width = 100 + "%";
  }

  if (recordScore >= 8000 && rewardRecordCount === 0) {
    showRewardPopup("first", "01");
  }
  if (recordScore >= 30000 && rewardRecordCount === 1) {
    showRewardPopup("second", "02");
  }
  if (recordScore >= 53000 && rewardRecordCount === 2) {
    showRewardPopup("third", "03");
  }
  if (recordScore >= 75000 && rewardRecordCount === 3) {
    showRewardPopup("forth", "04");
  }
  if (recordScore >= 100000 && rewardRecordCount === 4) {
    showRewardPopup("fifth", "05");
  }
}

// ***************************************************************************************

function showRewardPopup(name, imgNo) {
  overlay.style.display = "block";

  document.getElementById("rewardImage").src = "data/" + imgNo + ".png";

  showRewardDiv.style.display = "block";
  document.getElementById("doneBtn").addEventListener("click", function() {
    showRewardDiv.style.display = "none";
    overlay.style.display = "none";
    // update db that reward collected
    const rewardStatusSaveToDb = [
      {
        name: name,
        status: true
      }
    ];
    insert_records(rewardStatusSaveToDb, "rewardStatus");
    location.reload();
  });
}

// ***************************************************************************************

function displayResults(results) {
  resultTextArea.innerHTML = "";
  results.forEach(function(item) {
    let oldResult = resultTextArea.innerHTML;
    resultTextArea.innerHTML =
      oldResult +
      JSON.stringify(item.datetime) +
      " : " +
      JSON.stringify(item.answered) +
      " : " +
      JSON.stringify(item.correct) +
      " : " +
      JSON.stringify(item.wrong) +
      " : " +
      JSON.stringify(item.percent) +
      " : " +
      JSON.stringify(item.score) +
      " : " +
      JSON.stringify(item.table) +
      "\n";
  });
}

// ***************************************************************************************

function calcAnswer() {
  var userAnswer = userAnswerTextBox.value;

  if (userAnswer !== "") {
    var convertedUserAnswer = parseInt(userAnswer);

    if (convertedUserAnswer == firstNum * tableNumber) {
      resultMessage.innerHTML = "Correct - Well Done";
      resultMessage.style.backgroundColor = "green";
      score++;
      attempts++;
      resetUserInputBox();
      showSum();
    } else {
      // display message to user, clear textbox and give it focus
      resultMessage.innerHTML = "That's Wrong - Try Again";
      resultMessage.style.backgroundColor = "red";
      attempts++;
      resetUserInputBox();
    }

    // Show score in user interface
    scoreDisplay.innerHTML = score;
    userTries.innerHTML = attempts;
  }
}

// ***************************************************************************************

function showSum() {
  // generate a random number between 1 and 12
  let randomNumber = generateRandomNumber(11, 2);

  if (randomNumber == previousRandomNumber) {
    while (randomNumber == previousRandomNumber) {
      randomNumber = generateRandomNumber(11, 2);
      console.log("RM in sum1: " + randomNumber);
    }
    document.getElementById("sum1").innerHTML = randomNumber;
    previousRandomNumber = randomNumber;
  } else {
    document.getElementById("sum1").innerHTML = randomNumber;
    previousRandomNumber = randomNumber;
  }

  if (isRandomTables) {
    // generate a random number between 3 and 12
    let randomNumber2 = generateRandomNumber(11, 2);
    // assign random number between 3 and 12 to element
    document.getElementById("sum2").innerHTML = randomNumber2;

    // asign the random gen times table to the tableNumber variable
    tableNumber = randomNumber2;

    console.log("Rand2 = " + randomNumber2);
  } else {
    // assign users chosen times table number to element
    document.getElementById("sum2").innerHTML = tableNumber;
  }

  // and assign it to the firstNum variable
  firstNum = randomNumber;
}

// ***************************************************************************************

function generateRandomNumber(num1, num2) {
  return Math.floor(Math.random() * num1) + num2;
}

// ***************************************************************************************

function timeLimitTest() {
  timer = setInterval(countdown, 1000);
  gameHeader.innerHTML = "3 Minute<br>Tables Test";
  progressBar(time);
  timer2 = setInterval(checkGameStatus, 50);
}

// ***************************************************************************************

//  game timer countdown
function countdown() {
  if (time > 0) {
    time--;
  } else {
    gameRunning = false;
    //endOfTest();
    clearInterval(timer);
  }
  // show countdown in UI
  document.getElementById("timerDisplay").innerHTML =
    "Remaining Time: " + time + " seconds";
}

// **************************************************************************************

//  game timer countdown
function countdownToStartFunction() {
  if (countdownToStartSeconds > 1) {
    countdownToStartSeconds--;
  } else {
    clearInterval(countdownToStartTimer);
    countdownToStart.style.display = "none";
    countdownToStartDiv.style.display = "none";
  }
  // show countdown in UI
  countdownToStart.innerHTML = countdownToStartSeconds;
}

// **************************************************************************************

//  countdown timer to next timed test
function countdownToTimedTest() {
  timedTestBtn.disabled = true;
  timedTestBtn.innerHTML = "Please Wait!";
  if (countdownToNextTimedTest > 1) {
    countdownToNextTimedTest--;
    // show countdown in UI
    displayUIClock(countdownToNextTimedTest);
  } else {
    // stop timer
    clearInterval(countdownToNextTestTimer);
    // inform user that test is now available
    countdownToNextTestSubContainer.style.color = "red";
    countdownToNextTestSubContainer.style.fontSize = "30px";
    countdownToNextTestSubContainer.innerHTML = "Test Available!";
    timedTestBtn.disabled = false;
    timedTestBtn.innerHTML = "3 Minute <br />Time Limit Test";
  }
}

// **************************************************************************************

//  convert seconds to display countdown clock in UI
function displayUIClock(seconds) {
  const h = Math.floor(seconds / 60 / 60) % 24;
  const m = Math.floor(seconds / 60) % 60;
  const s = Math.floor(seconds) % 60;

  hoursToNextTestElement.innerHTML = h;
  minutesToNextTestElement.innerHTML = m < 10 ? "0" + m : m;
  secondsToNextTestElement.innerHTML = s < 10 ? "0" + s : s;
}

// ***************************************************************************************

function progressBar(time) {
  let timedProgressBar = document.getElementById("timedProgressBar");
  timedProgressBar.style.display = "block";
  let colouredBar = document.getElementById("colouredBar");
  let width = 1;
  let id = setInterval(frame, time * 10);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
      //i = 0;
    } else {
      width++;
      colouredBar.style.width = width + "%";
      if (width >= 50) {
        colouredBar.style.backgroundColor = "orange";
      }
      if (width >= 80) {
        colouredBar.style.backgroundColor = "red";
      }
    }
  }
}

// ***************************************************************************************

// CLEARS INPUT BOX AND GIVES IT FOCUS
function resetUserInputBox() {
  document.getElementById("userAnswerTextBox").focus();
  document.getElementById("userAnswerTextBox").value = "";
}

// ***************************************************************************************

function checkGameStatus() {
  if (!gameRunning && time === 0) {
    showResults();
    clearInterval(timer2);
  }
}

// ***************************************************************************************

function showResults() {
  // Hide the game screen
  defaultGame.style.display = "none";

  // create new elements
  const resultContainer = document.createElement("div");
  resultContainer.className = "sub-container";
  const header = document.createElement("h1");
  header.textContent = "Test Results";
  header.className = "mb-3";
  const amount = document.createElement("h5");
  amount.textContent = "You Answered a total of " + attempts + " sums";

  const correct = document.createElement("h4");
  correct.textContent = "Correct Answers: " + score;

  const wrong = document.createElement("h4");
  // get qty of wrong answers
  const incorrectAnswers = attempts - score;
  // display wrong answer qty in IU
  wrong.textContent = "Wrong Answers: " + incorrectAnswers;

  let testPercent = (score / attempts) * 100;
  let percentToTwoDecimalPlaces = testPercent.toFixed("1");

  // run the animated percentage score
  testPercentAnimation(percentToTwoDecimalPlaces);

  const questionScore = document.createElement("h4");
  let questionScoreValue = score * 10 - incorrectAnswers * 5;

  if (questionScoreValue < 0) questionScoreValue = 0;

  questionScore.textContent = "Question Score: " + questionScoreValue;

  // only add bonus points if attemps was 30 or greater
  if (attempts >= 30) {
    createBonus = calculateBonus(percentToTwoDecimalPlaces);
  }

  const bonus = document.createElement("h4");
  bonus.textContent = "Bonus: " + createBonus;

  const totalScore = document.createElement("h3");
  const totalPlayerScore = questionScoreValue + createBonus;
  totalScore.textContent = "Total Score: " + totalPlayerScore;

  const menuButton = document.createElement("button");
  menuButton.classList = "btn btn-info backToMenuBtn mt-3";
  menuButton.textContent = "Back To Menu";

  /************************************************************************
   ************************************************************************** */

  // create date and time stamp and format for easy reading - e.g 17-Jan-2021:22.14
  const d = new Date();
  const ye = new Intl.DateTimeFormat("en-GB", { year: "numeric" }).format(d);
  const mo = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d);
  const da = new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(d);
  const hr = new Intl.DateTimeFormat("en-GB", { hour: "numeric" }).format(d);
  const min = new Intl.DateTimeFormat("en-GB", { minute: "numeric" }).format(d);
  const resultDateTime = `${da}-${mo}-${ye}-${hr}:${min}`;

  // create an object containing results
  const gameResultsForLocalStorage = [
    {
      datetime: resultDateTime,
      answered: attempts,
      correct: score,
      wrong: incorrectAnswers,
      percent: percentToTwoDecimalPlaces,
      score: totalPlayerScore,
      table: numSelect.value
    }
  ];

  // save game results data to local storage
  insert_records(gameResultsForLocalStorage, "gameResults");

  /************************************************************************
   ************************************************************************** */

  resultContainer.appendChild(header);
  resultContainer.appendChild(amount);
  resultContainer.appendChild(correct);
  resultContainer.appendChild(wrong);
  resultContainer.appendChild(percent);
  resultContainer.appendChild(questionScore);
  resultContainer.appendChild(bonus);
  resultContainer.appendChild(totalScore);
  resultContainer.appendChild(menuButton);

  // add new elements to container
  const appContainer = document.querySelector("#container");
  appContainer.appendChild(resultContainer);

  // disable the timed test button
  //timedTestBtn.disabled = true;

  // added again as back to menu button not working after timer finished
  var modals = document.getElementsByClassName("backToMenuBtn");
  for (var i = 0; i < modals.length; i++) {
    modals[i].addEventListener("click", function() {
      location.reload();
    });
  }
}

// ***************************************************************************************

function testPercentAnimation(userPercent) {
  // start timer - increment every 15th second
  animTimer = setInterval(function() {
    // add 1 to num and display until num equals test percentage
    if (num < userPercent) {
      num++;
      percent.textContent = num + "%";
    } else {
      clearInterval(animTimer);
    }
  }, 15);
}

// ***************************************************************************************

function calculateBonus(_bonus) {
  console.log(_bonus);
  switch (true) {
    case _bonus >= 70.0 && _bonus <= 74.9:
      return 50;
      break;
    case _bonus >= 75.0 && _bonus <= 79.9:
      return 100;
      break;
    case _bonus >= 80.0 && _bonus <= 84.9:
      return 200;
      break;
    case _bonus >= 85.0 && _bonus <= 89.9:
      return 350;
      break;
    case _bonus >= 90.0 && _bonus <= 94.9:
      return 500;
      break;
    case _bonus >= 95.0 && _bonus <= 99.9:
      return 750;
      break;
    case _bonus == 100:
      return 1000;
      break;
    default:
      return 0;
      break;
  }
}
