const reelSymbols = ["🍒", "🍋", "🍊", "🍉", "🍇", "🍓", "7️⃣"];
const reel1 = document.getElementById("reel1").querySelector(".symbols");
const reel2 = document.getElementById("reel2").querySelector(".symbols");
const reel3 = document.getElementById("reel3").querySelector(".symbols");
const result = document.getElementById("result");
const spinButton = document.getElementById("spinButton");
const stopButton1 = document.getElementById("stopButton1");
const stopButton2 = document.getElementById("stopButton2");
const stopButton3 = document.getElementById("stopButton3");
const betOneButton = document.getElementById("betOne");
const betTenButton = document.getElementById("betTen");
const currentBetElement = document.getElementById("currentBet");
const availableCoinsElement = document.getElementById("availableCoins");
const doubleDownButton = document.getElementById("doubleDownButton");

let isSpinning = false;
let canStop = false;
let stopReel1 = false;
let stopReel2 = false;
let stopReel3 = false;
let finalPositions = [0, 0, 0];
let currentBet = 0;
let availableCoins = 100; // 初期コイン所持数を100に設定
let lastPayout = 0; // 最後のペイアウトを記憶するための変数
let spinsSinceLastWin = 0; // 最後の勝利からのスピン回数

const maxBet = 100;
const baseOdds = {
  "🍒": 0.3,
  "🍋": 0.2,
  "🍊": 0.2,
  "🍉": 0.15,
  "🍇": 0.1,
  "🍓": 0.05,
  "7️⃣": 0.02,
};
const payouts = {
  "🍒": 2,
  "🍋": 3,
  "🍊": 4,
  "🍉": 5,
  "🍇": 6,
  "🍓": 7,
  "7️⃣": 77, // ラッキー7のコイン倍率を77に変更
};

// 音声ファイル
const betSound = new Audio("../sound/bet.mp3");
const spinSound = new Audio("../sound/spin.mp3");
const stopSound = new Audio("../sound/stop.mp3");
const matchSound = new Audio("../sound/match.mp3");
const roleSound = new Audio("../sound/role.mp3");
roleSound.loop = true; // ループ再生を設定

betOneButton.addEventListener("click", () => {
  if (!isSpinning) {
    placeBet(1);
    playSound(betSound);
  }
});
betTenButton.addEventListener("click", () => {
  if (!isSpinning) {
    placeBet(10);
    playSound(betSound);
  }
});
spinButton.addEventListener("click", () => {
  if (!isSpinning) {
    spin();
    playSound(spinSound);
    roleSound.play(); // リールが回転する音を再生
  }
});
stopButton1.addEventListener("click", () => {
  if (canStop && isSpinning) {
    stopReel(1);
    playSound(stopSound);
  }
});
stopButton2.addEventListener("click", () => {
  if (canStop && isSpinning) {
    stopReel(2);
    playSound(stopSound);
  }
});
stopButton3.addEventListener("click", () => {
  if (canStop && isSpinning) {
    stopReel(3);
    playSound(stopSound);
  }
});
doubleDownButton.addEventListener("click", doubleDown);

document.addEventListener("keydown", (e) => {
  if (!isSpinning || !canStop) return; // スピン中でなければ何もしない
  if (e.key === "ArrowLeft") {
    stopReel(1);
    playSound(stopSound);
  } else if (e.key === "ArrowDown") {
    stopReel(2);
    playSound(stopSound);
  } else if (e.key === "ArrowRight") {
    stopReel(3);
    playSound(stopSound);
  } else if (e.key === "ArrowUp") {
    if (!isSpinning) {
      spin();
      playSound(spinSound);
      roleSound.play(); // リールが回転する音を再生
    }
  } else if (e.key === "1") {
    if (!isSpinning) {
      placeBet(1);
      playSound(betSound);
    }
  } else if (e.key === "0") {
    if (!isSpinning) {
      placeBet(10);
      playSound(betSound);
    }
  }
});

function playSound(sound) {
  sound.currentTime = 0; // サウンドを最初から再生
  sound.play();
}

function placeBet(amount) {
  if (availableCoins >= amount && currentBet + amount <= maxBet) {
    currentBet += amount;
    availableCoins -= amount;
    updateDisplay();
  } else if (currentBet + amount > maxBet) {
    result.textContent = `1プレイの上限賭け枚数は${maxBet}コインまでです。`;
  } else {
    result.textContent = "コインが足りません。";
  }
}

function updateDisplay() {
  currentBetElement.textContent = currentBet;
  availableCoinsElement.textContent = availableCoins;
}

function spin() {
  if (isSpinning || currentBet === 0) return;

  isSpinning = true;
  canStop = false;
  stopReel1 = stopReel2 = stopReel3 = false;
  finalPositions = [0, 0, 0];
  result.textContent = "";
  doubleDownButton.style.display = "none"; // ダブルダウンボタンを隠す

  spinReel(reel1, 0);
  spinReel(reel2, 1);
  spinReel(reel3, 2);

  setTimeout(() => {
    canStop = true;
  }, 1000); // 1秒後にストップボタンを押せるようにする
}

function spinReel(reel, reelIndex) {
  let index = Math.floor(Math.random() * reelSymbols.length);
  const symbols = Array.from(reel.querySelectorAll(".symbol"));
  const totalSymbols = symbols.length;

  reel.style.transition = `top 0.1s ease-out`;
  const interval = setInterval(() => {
    if (
      (reelIndex === 0 && stopReel1) ||
      (reelIndex === 1 && stopReel2) ||
      (reelIndex === 2 && stopReel3)
    ) {
      clearInterval(interval);
      finalPositions[reelIndex] = index;
      return;
    }

    index = Math.floor(Math.random() * totalSymbols);
    reel.style.top = `-${index * 100}px`;
    if (index === 0) {
      reel.style.transition = "none";
      reel.style.top = `0px`;
      setTimeout(() => {
        reel.style.transition = `top 0.1s ease-out`;
      }, 10);
    }
  }, 50);
}

function stopReel(reelNumber) {
  if (reelNumber === 1) stopReel1 = true;
  if (reelNumber === 2) stopReel2 = true;
  if (reelNumber === 3) stopReel3 = true;

  if (stopReel1 && stopReel2 && stopReel3) {
    isSpinning = false;
    roleSound.pause(); // リールの回転音を停止
    roleSound.currentTime = 0; // 再生位置をリセット
    setTimeout(checkResult, 500);
  }
}

function checkResult() {
  const result1 = reelSymbols[finalPositions[0]];
  const result2 = reelSymbols[finalPositions[1]];
  const result3 = reelSymbols[finalPositions[2]];

  if (result1 === result2 && result2 === result3) {
    lastPayout = payouts[result1] * currentBet;
    availableCoins += lastPayout;
    result.textContent = `${lastPayout}コイン獲得！`;
    playSound(matchSound); // 絵柄が揃った時の音声再生
    doubleDownButton.style.display = "inline"; // ダブルダウンボタンを表示
    spinsSinceLastWin = 0; // 勝利回数をリセット
  } else {
    result.textContent = "残念！";
    lastPayout = 0; // 勝利しなかった場合はペイアウトをリセット
    spinsSinceLastWin++; // 勝利しなかった回数をカウント
  }

  currentBet = 0;
  updateDisplay();
}

function doubleDown() {
  let playerGuess;
  while (true) {
    playerGuess = prompt("表か裏、どっち？").toLowerCase();
    if (playerGuess === "表" || playerGuess === "裏") break;
    alert("「表」か「裏」を入力してください。");
  }

  const guess = Math.random() < 0.5 ? "表" : "裏";

  if (playerGuess === guess) {
    availableCoins += lastPayout; // コインを倍にする
    result.textContent = `ダブルダウン成功！${
      lastPayout * 2
    }コインになりました。`;
  } else {
    availableCoins -= lastPayout; // コインを失う
    result.textContent = `ダブルダウン失敗。${lastPayout}コインを失いました。`;
  }

  lastPayout = 0; // ペイアウトをリセット
  updateDisplay();
  doubleDownButton.style.display = "none"; // ダブルダウンボタンを隠す
}

function getAdjustedOdds() {
  const adjustedOdds = { ...baseOdds };
  const adjustmentFactor = Math.min(0.1 * spinsSinceLastWin, 1);
  for (const symbol in adjustedOdds) {
    adjustedOdds[symbol] += adjustmentFactor * (1 / payouts[symbol]);
  }
  return adjustedOdds;
}

function chooseSymbol() {
  const adjustedOdds = getAdjustedOdds();
  const totalWeight = Object.values(adjustedOdds).reduce((a, b) => a + b, 0);
  let randomValue = Math.random() * totalWeight;

  for (const symbol in adjustedOdds) {
    randomValue -= adjustedOdds[symbol];
    if (randomValue <= 0) {
      return symbol;
    }
  }
  return "🍒"; // デフォルトでチェリーを返す
}
