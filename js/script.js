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

// 現在時刻
const now = new Date();

// 経過した日数と経過％
const pastDaysString = String(getPastDays(now));
const pastPerString = getPastPerString(now);

// 残り日数及び時間と残り％
const leftDaysString = getLeftTimeString(getLeftDays(now), getLeftTime(now));
const leftPerString = getLeftPerString(now);

// 要素の取得
const pastTimeEl = document.querySelector('#pasttime');
const leftTimeEl = document.querySelector('#lefttime');

// 要素のtextContentに表示
pastTimeEl.textContent = `
  ${String(now.getFullYear())} 年は
  ${pastDaysString} 日 (${pastPerString}%) が経過しました。
  `;
leftTimeEl.textContent = `残り ${leftDaysString} (${leftPerString}%) です。`;

// グラフデータの作成と描画
const today = new Date();
const graphData = createGraphData(today);
drawGraph(graphData);

// -----------------------------------------------
// ユーティリティ関数
// -----------------------------------------------

/**
 * その年の一年の日数を返す
 * @param {Date} date 今日
 * @returns {number} 今年の日数
 */
function getThisYearDays(date) {
  const year = date.getFullYear();
  const isLeapYear = new Date(year, 2, 0).getDate() === 29;
  return isLeapYear ? 366 : 365;
}

/**
 * その年の経過日数を返す
 * @param {Date} date 今日
 * @returns {number} 経過日数
 */
function getPastDays(date) {
  const beginDate = new Date(date.getFullYear(), 0, 0);
  const pastMS = date - beginDate;
  return Math.floor(pastMS / 1000 / 60 / 60 / 24);
}

/**
 * その年の経過％を返す
 * @param {Date} date
 * @returns {string} 経過％
 */
function getPastPerString(date) {
  const pastMS = date - new Date(date.getFullYear(), 0, 0);
  const fullMS = getThisYearDays(date) * 24 * 60 * 60 * 1000;
  return ((pastMS / fullMS) * 100).toFixed(2);
}

/**
 * その年の残り日数を返す
 * @param {Date} date
 * @returns {number} 残り日数
 */
function getLeftDays(date) {
  return getThisYearDays(date) - getPastDays(date);
}

/**
 * その年の残り時間を返す
 * @param {Date} date
 * @returns {object} 残り時間（時、分、秒）
 */
function getLeftTime(date) {
  const hour = String(24 - date.getHours()).padStart(2, 0);
  const min = String(60 - date.getMinutes()).padStart(2, 0);
  const sec = String(60 - date.getSeconds()).padStart(2, 0);
  return { hour, min, sec };
}

/**
 * 残り日数、時間の文字列を組み立てて返す
 * @param {number} leftDays
 * @param {object} leftTime
 * @returns {string} 残り日数・時間
 */
function getLeftTimeString(leftDays, leftTime) {
  const { hour, min, sec } = leftTime;
  const days = String(
    hour === 0 && min === 0 ? leftDays : leftDays - 1
  );
  return `${days} 日 ${hour} 時間 ${min} 分 ${sec} 秒`;
}

/**
 * その年の残り％を返す
 * @param {Date} date
 * @returns {string} 残り%
 */
function getLeftPerString(date) {
  return (100 - Number(getPastPerString(date))).toFixed(2);
}

// -----------------------------------------------
// グラフデータ
// -----------------------------------------------

/**
 * グラフデータを作成
 * @param {Date} date
 * @returns {object} グラフデータ
 */
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

// -----------------------------------------------
// グラフの描画(chart.js)
// -----------------------------------------------

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
