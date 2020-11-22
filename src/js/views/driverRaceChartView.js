import Chart from 'chart.js';
import * as mapping from '../mapping.js';

class DriverRaceChartView {
  _ctx = document.getElementById('driver__race__chart').getContext('2d');

  _chart = new Chart(this._ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      title: {
        display: true,
        text: 'Points scored in race'
      },
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
    const results = dataset['results'];
    const raceNames = dataset['raceNames'];
    const driverInfo = dataset['driverInfo'];
    const constructor = mapping.constructorMap[driverInfo['driverId']];

    this._chart.data = {
      labels: raceNames,
      datasets: [{
        label: driverInfo['givenName'] + ' ' + driverInfo['familyName'],
        data: results['driver']['points'],
        backgroundColor: mapping.constructorColors[constructor],
        borderColor: mapping.constructorColors[constructor],
        fill: 'false',
      },
      {
        label: results['teamMate']['name'][0],
        data: results['teamMate']['points'],
        backgroundColor: mapping.constructorColors[constructor],
        borderColor: mapping.constructorColors[constructor],
        borderDash: [5, 15],
        fill: 'false',
      }
    ],
    }
    this._chart.update();
  }
}

export default new DriverRaceChartView();
