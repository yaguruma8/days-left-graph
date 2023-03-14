'use strict';

// -----------------------------------------------
// 定数
// -----------------------------------------------

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

// テキストの%表示の小数点以下の桁数
const PERCENT_FIXED_NUM = 5;

// -----------------------------------------------
// メインロジック
// -----------------------------------------------

/**
 * テキストの描画
 * @param {Date} date
 */
const printDates = (date) => {
  // 経過日数
  const pastDaysString = String(getPastDays(date));
  const pastPerString = getPastPerString(date);
  // 残り日数
  const leftDaysString = getLeftTimeString(
    getLeftDays(date),
    getLeftTime(date)
  );
  const leftPerString = getLeftPerString(date);
  // 要素を取得して表示
  document.querySelector('#pasttime').textContent = `
    ${String(date.getFullYear())} 年は
    ${pastDaysString} 日 (${pastPerString}%) が経過しました。
    `;
  document.querySelector('#lefttime').textContent = `
    残り ${leftDaysString} (${leftPerString}%) です。
    `;
};

/**
 * グラフデータの生成と描画（クロージャ）
 * @param {Date} date
 * @returns {Function} グラフを描画する
 */
const printGraphClosure = (date) => {
  let today = date;
  const graphData = createGraphData(today);
  let canvas = drawGraph(graphData);
  return (date) => {
    // 日付が変わった場合todayをdateで上書きしてグラフを再描画する
    if (today.getDate() !== date.getDate()) {
      today = date;
      const graphData = createGraphData(today);
      canvas.remove();
      canvas = drawGraph(graphData);
    }
  };
};

// 初期描画
const today = new Date();
printDates(today);
const printGraph = printGraphClosure(today);

// 1秒ごとに更新
window.setInterval(() => {
  const now = new Date();
  printDates(now);
  printGraph(now);
}, 1000);

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
  return Math.floor(pastMS / (1000 * 60 * 60 * 24));
}

/**
 * その年の経過％を返す
 * @param {Date} date
 * @returns {string} 経過％
 */
function getPastPerString(date) {
  const pastMS = date - new Date(date.getFullYear(), 0, 0);
  const fullMS = getThisYearDays(date) * (1000 * 60 * 60 * 24);
  return ((pastMS / fullMS) * 100).toFixed(PERCENT_FIXED_NUM);
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
  const hour = String(23 - date.getHours()).padStart(2, 0);
  const min = String(59 - date.getMinutes()).padStart(2, 0);
  const sec = String(59 - date.getSeconds()).padStart(2, 0);
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
  const days = String(hour === 0 && min === 0 ? leftDays : leftDays - 1);
  return `${days} 日 ${hour} 時間 ${min} 分 ${sec} 秒`;
}

/**
 * その年の残り％を返す
 * @param {Date} date
 * @returns {string} 残り%
 */
function getLeftPerString(date) {
  return (100 - Number(getPastPerString(date))).toFixed(PERCENT_FIXED_NUM);
}

// -----------------------------------------------
// グラフデータ
// -----------------------------------------------

/**
 * グラフデータを作成する
 * @param {Date} date
 * @returns {object} グラフデータ
 */
function createGraphData(date) {
  const labels = [];
  const data = [];
  const backgroundColors = [];

  for (let i = 0; i < 12; i++) {
    if (i === date.getMonth()) {
      // 当月の場合はpastとleftで色分けする
      const daysInMonth = new Date(date.getFullYear(), i + 1, 0).getDate();
      labels.push(`${i + 1}月`, `${i + 1}月`);
      data.push(date.getDate(), daysInMonth - date.getDate());
      backgroundColors.push(BG_COLORS[i + 1].past, BG_COLORS[i + 1].left);
    } else {
      const daysInMonth = new Date(date.getFullYear(), i + 1, 0).getDate();
      const colorLabel = i < date.getMonth() ? 'past' : 'left';
      labels.push(`${i + 1}月`);
      data.push(daysInMonth);
      backgroundColors.push(BG_COLORS[i + 1][colorLabel]);
    }
  }
  return { labels, data, backgroundColors };
}

// -----------------------------------------------
// グラフの描画(chart.js)
// -----------------------------------------------

/**
 * グラフを描画する
 * @param {object} graphData
 * @returns {HTMLElement} canvas
 */
function drawGraph(graphData) {
  const { labels, data, backgroundColors } = graphData;
  const canvas = document.createElement('canvas');
  document.querySelector('#chartContainer').appendChild(canvas);
  // chart.js
  new Chart(canvas, {
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
  return canvas;
}
