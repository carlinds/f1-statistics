import Chart from 'chart.js';

const driverColors = {
  giovinazzi: 'rgba(155, 0, 0, 0.8)',
  raikkonen: 'rgba(155, 0, 0, 0.8)',
  gasly: 'rgba(70, 155, 255, 0.8)',
  kvyat: 'rgba(70, 155, 255, 0.8)',
  vettel: 'rgba(220, 1, 1, 0.8)',
  leclerc: 'rgba(220, 1, 1, 0.8)',
  kevin_magnussen: '	rgba(190, 159, 89, 0.8)',
  grosjean: '	rgba(190, 159, 89, 0.8)',
  sainz: 'rgba(255, 135, 0, 0.8)',
  norris: 'rgba(255, 135, 0, 0.8)',
  hamilton: '	rgba(0, 210, 190, 0.8)',
  bottas: '	rgba(0, 210, 190, 0.8)',
  perez: 'rgba(245, 150, 200, 0.8)',
  stroll: 'rgba(245, 150, 200, 0.8)',
  max_verstappen: 'rgba(30, 65, 255, 0.8)',
  albon: 'rgba(30, 65, 255, 0.8)',
  ricciardo: 'rgba(255, 245, 0, 0.8)',
  ocon: 'rgba(255, 245, 0, 0.8)',
  russell: 'rgba(245, 245, 245, 0.8)',
  latifi: 'rgba(245, 245, 245, 0.8)',
};

class DriverChartView {
  _ctx = document.getElementById('driver__chart').getContext('2d');

  _chart = new Chart(this._ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45,
            },
          },
        ],
      },
    },
  });

  renderDataset(dataset) {
    const [points, raceNames, driverInfo] = dataset;

    console.log(points);
    this._chart.data = {
      labels: raceNames,
      datasets: [{
        label: driverInfo['givenName'] + ' ' + driverInfo['familyName'],
        data: points,
        backgroundColor: driverColors[driverInfo['driverId']],
        borderColor: driverColors[driverInfo['driverId']],
        fill: 'false',
      }],
    }
    this._chart.update();
  }
}

export default new DriverChartView();
