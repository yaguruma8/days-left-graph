console.log('hello!');

// 要素の取得
const thisYearElement = document.querySelector('#thisyear');
const pastDaysElement = document.querySelector('#pastdays');
const leftDaysElement = document.querySelector('#leftdays');

// 日付の計算
const now = new Date();
const thisYear = now.getFullYear();
// 経過日数を計算
const pastDays = getPastDays(now);
// 残り日数を計算
const leftDays = isLeapYear(now) ? 366 - pastDays : 365 - pastDays;
console.log(pastDays, leftDays);

// 要素のtextContentに表示
thisYearElement.textContent = String(thisYear);
pastDaysElement.textContent = String(pastDays);
leftDaysElement.textContent = String(leftDays);

// グラフの表示 (chart.js)
// データの作成
let labels = [];
let data = [];
for (let i = 1; i <= 12; i++) {
  labels.push(`${i}月`);
  labels.push('');
  data.push(new Date(thisYear, i, 0).getDate());
  data.push(0);
}

const ctx = document.getElementById('myChart');
new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: labels,
    datasets: [
      {
        label: 'days left in the year',
        data: data,
        backgroundColor: ['lightgray'],
        hoverOffset: 0,
      },
    ],
  },
  options: {
    // Add plugins to options.
    plugins: {
      legend: {
        // グラフのラベルを非表示にする（hoverでは表示される)
        display: false,
      },
    },
  },
  // options: {
  //   animations: {
  //     tension: {
  //       duration: 1000,
  //       easing: 'linear',
  //       from: 1,
  //       to: 0,
  //       loop: true
  //     }
  //   },
  // }
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
