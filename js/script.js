'use strict';
// 定数
// グラフの色
const BG_COLOR_PAST = 'lightgray';
const BG_COLOR_LEFT = 'pink';

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
// 残り日数を計算
const leftDays = thisYearDays - pastDays;
// 残り時間を計算
// todo: 0:00の時に23時間60分になるので修正考えること
const leftHours = 23 - now.getHours();
const leftMinutes = 60 - now.getMinutes();
const leftTimeString = `${leftHours} 時間 ${leftMinutes} 分`
// 経過％を計算
const pastPar = ((pastDays / thisYearDays) * 100).toFixed(1);
// 残り％を計算
const leftPar = (100 - Number(pastPar)).toFixed(1);
console.log(pastDays, leftDays, pastPar, leftPar);

// 要素のtextContentに表示
thisYearElement.textContent = String(thisYear);
pastDaysElement.textContent = `${String(pastDays)} 日 (${pastPar}%)`;
leftDaysElement.textContent = `${String(
  leftDays
)} 日 と ${leftTimeString} (${leftPar}%)`;

// グラフの表示 (chart.js)
// データの作成
let labels = [];
let data = [];
let backgroundColor = [];
let past = pastDays;
for (let i = 1; i <= 12; i++) {
  const thisMonthDays = new Date(thisYear, i, 0).getDate();
  // pastが残り0日以下 = left
  // pastが残り0日より大きく、thisMonthDays以下 = pastとleft
  // pastがthisMonthDaysより大きい = past
  if (past > thisMonthDays) {
    labels.push(`${i}月`);
    labels.push('');
    data.push(thisMonthDays);
    data.push(0);
    backgroundColor.push(BG_COLOR_PAST);
    backgroundColor.push(BG_COLOR_PAST);
  } else if (past > 0 && past <= thisMonthDays) {
    labels.push(`${i}月`);
    labels.push(`${i}月`);
    data.push(past);
    data.push(thisMonthDays - past);
    backgroundColor.push(BG_COLOR_PAST);
    backgroundColor.push(BG_COLOR_LEFT);
  } else {
    labels.push('');
    labels.push(`${i}月`);
    data.push(0);
    data.push(thisMonthDays);
    backgroundColor.push(BG_COLOR_LEFT);
    backgroundColor.push(BG_COLOR_LEFT);
  }
  past -= thisMonthDays;
}

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
