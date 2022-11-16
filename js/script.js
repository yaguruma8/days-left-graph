'use strict';
// 定数
// グラフの色
// 参考 : https://iro-color.com/colorchart/tone/vivid-tone.html
const BG_COLORS = {
  1: { past: '#FBDAC8', left: '#EA5532' },
  2: { past: '#FEECD2', left: '#F6AD3C' },
  3: { past: '#FFFCDB', left: '#FFF33F' },
  4: { past: '#ECF4D9', left: '#AACF52' },
  5: { past: '#D5EAD8', left: '#00A95F' },
  6: { past: '#D4ECEA', left: '#00ADA9' },
  7: { past: '#D3EDFB', left: '#00AFEC' },
  8: { past: '#D3DEF1', left: '#187FC4' },
  9: { past: '#D2CCE6', left: '#4D4398' },
  10: { past: '#E7D5E8', left: '#A64A97' },
  11: { past: '#FADCE9', left: '#E85298' },
  12: { past: '#FADBDA', left: '#E9546B' },
};

// 要素の取得
const thisYearElement = document.querySelector('#thisyear');
const pastDaysElement = document.querySelector('#pastdays');
const leftDaysElement = document.querySelector('#leftdays');

// 日付の計算
const now = new Date();
const thisYear = now.getFullYear();
const thisYearDays = getThisYearDays(isLeapYear(now));

// 経過日数を計算
const pastDays = getPastDays(now);

// 残り日数と時間を計算
const leftDays = thisYearDays - pastDays;
const leftTime = 60 * 24 - 60 * now.getHours() - now.getMinutes();
const leftHours = Math.floor(leftTime / 60);
const leftMinutes = leftTime - leftHours * 60;
const leftTimeString = getLeftTimeString(leftDays, leftHours, leftMinutes);

// 経過％を計算
const pastPar = ((pastDays / thisYearDays) * 100).toFixed(1);
// 残り％を計算
const leftPar = (100 - Number(pastPar)).toFixed(1);
console.log(pastDays, leftDays, pastPar, leftPar);

// 要素のtextContentに表示
thisYearElement.textContent = String(thisYear);
pastDaysElement.textContent = `${String(pastDays)} 日 (${pastPar}%)`;
leftDaysElement.textContent = `${leftTimeString} (${leftPar}%)`;

// グラフデータの作成
let labels = [];
let data = [];
let backgroundColor = [];
let past = pastDays;
for (let i = 1; i <= 12; i++) {
  const thisMonthDays = new Date(thisYear, i, 0).getDate();
  // pastがthisMonthDaysより大きい = past
  // pastが残り0日より大きく、thisMonthDays以下 = pastとleft
  // pastが残り0日以下 = left
  if (past > thisMonthDays) {
    labels.push(`${i}月`);
    data.push(thisMonthDays);
    backgroundColor.push(BG_COLORS[i].past);
  } else if (past > 0 && past <= thisMonthDays) {
    labels.push(`${i}月`);
    labels.push(`${i}月`);
    data.push(past);
    data.push(thisMonthDays - past);
    backgroundColor.push(BG_COLORS[i].past);
    backgroundColor.push(BG_COLORS[i].left);
  } else {
    labels.push(`${i}月`);
    data.push(thisMonthDays);
    backgroundColor.push(BG_COLORS[i].left);
  }
  past -= thisMonthDays;
}

// グラフの表示 (chart.js)
const ctx = document.getElementById('chart');
new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: labels,
    datasets: [
      {
        label: 'days left in the year',
        data: data,
        backgroundColor: backgroundColor,
        borderWidth: 1,
        hoverOffset: 0,
      },
    ],
  },
  options: {
    plugins: {
      legend: {
        // グラフのラベルを非表示にする（hoverでは表示される)
        display: false,
      },
    },
  },
});

// ユーティリティ関数

// 一年の経過日数を返す
function getPastDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const dateOfMonth = date.getDate();
  let leftDays = 0;
  for (let i = 1; i < month; i++) {
    leftDays += new Date(year, i, 0).getDate();
  }
  leftDays += dateOfMonth;
  return leftDays;
}

// 閏年の判定
function isLeapYear(date) {
  const year = date.getFullYear();
  return new Date(year, 2, 0).getDate() === 29;
}

// その年の一年の日数を返す
function getThisYearDays(isLeapYear) {
  return isLeapYear ? 366 : 365;
}

// 残り時間の文字列を組み立てる
function getLeftTimeString(day, hour, minute) {
  // 0時0分 : 残り(x)日, 0時1分: 残り(x-1)日と23時間59分
  // 1時0分: 残り(x-1)日と23時間, 1時1分: 残り(x-1)日と22時間59分
  if (hour === 0 && minute === 0) {
    return `${day} 日`;
  } else if (minute === 0) {
    return `${day - 1} 日 と ${hour} 時間`;
  } else {
    return `${day - 1} 日 と ${hour} 時間 ${minute} 分`;
  }
}
