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

// 日付等の取得
const now = new Date();
const thisYear = now.getFullYear();
const thisYearDays = getThisYearDays(isLeapYear(now));

// 経過日数を計算
const pastDays = getPastDays(now);
const pastDaysString = `${pastDays} 日`;

// 残り日数と時間を計算
const leftDays = thisYearDays - pastDays;
const leftTime = getLeftTime(now);
const leftDaysString = getLeftDaysString(leftDays, leftTime);

// 経過％と残り％を計算
const { pastPar, leftPar } = getPersentPastAndLeftTime(now);

console.log(pastDays, leftDays, pastPar, leftPar);

// 要素のtextContentに表示
thisYearElement.textContent = String(thisYear);
pastDaysElement.textContent = `${pastDaysString} (${pastPar}%)`;
leftDaysElement.textContent = `${leftDaysString} (${leftPar}%)`;

// グラフデータの作成
const graphData = createGraphData(now);

// グラフの表示 (chart.js)
drawGraph(graphData);

// ユーティリティ関数

// 一年の経過日数を返す
function getPastDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  let pastDays = 0;
  for (let i = 1; i < month; i++) {
    pastDays += new Date(year, i, 0).getDate();
  }
  pastDays += date.getDate();
  return pastDays;
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

function getLeftTime(date) {
  const time = 60 * 24 - 60 * date.getHours() - date.getMinutes();
  const hour = Math.floor(time / 60);
  const minute = time - hour * 60;
  return { hour, minute };
}

// 残り時間の文字列を組み立てる
function getLeftDaysString(leftDays, time) {
  const { hour, minute } = time;
  // 0時0分 : 残り(x)日, 0時1分: 残り(x-1)日と23時間59分
  // 1時0分: 残り(x-1)日と23時間, 1時1分: 残り(x-1)日と22時間59分
  if (hour === 0 && minute === 0) {
    return `${leftDays} 日`;
  } else if (minute === 0) {
    return `${leftDays - 1} 日 と ${hour} 時間`;
  } else {
    return `${leftDays - 1} 日 と ${hour} 時間 ${minute} 分`;
  }
}

// 経過と残りの時間の割合を計算して返す
function getPersentPastAndLeftTime(date) {
  const thisYearDays = getThisYearDays(isLeapYear(date));
  const pastDays = getPastDays(date);
  const pastPar = ((pastDays / thisYearDays) * 100).toFixed(2);
  const leftPar = (100 - Number(pastPar)).toFixed(2);
  return { pastPar, leftPar };
}

// グラフデータの作成
function createGraphData(date) {
  const graphData = {
    labels: [],
    data: [],
    backgroundColors: [],
  };
  const thisYear = date.getFullYear();
  let pastDays = getPastDays(date);

  for (let i = 1; i <= 12; i++) {
    const thisMonthDays = new Date(thisYear, i, 0).getDate();
    if (pastDays > thisMonthDays) {
      // 経過済みの月
      graphData.labels.push(`${i}月`);
      graphData.data.push(thisMonthDays);
      graphData.backgroundColors.push(BG_COLORS[i].past);
    } else if (pastDays > 0 && pastDays <= thisMonthDays) {
      // 経過中の月
      // 経過済みの日
      graphData.labels.push(`${i}月`);
      graphData.data.push(pastDays);
      graphData.backgroundColors.push(BG_COLORS[i].past);
      // まだ残っている日
      graphData.labels.push(`${i}月`);
      graphData.data.push(thisMonthDays - pastDays);
      graphData.backgroundColors.push(BG_COLORS[i].left);
    } else {
      // まだ残っている月
      graphData.labels.push(`${i}月`);
      graphData.data.push(thisMonthDays);
      graphData.backgroundColors.push(BG_COLORS[i].left);
    }
    pastDays -= thisMonthDays;
  }
  return graphData;
}

// グラフの描画
function drawGraph(graphData) {
  const { labels, data, backgroundColors } = graphData;
  const ctx = document.getElementById('chart');
  // chart.js
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'days left in the year',
          data: data,
          backgroundColor: backgroundColors,
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
}
