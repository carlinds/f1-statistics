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
    const constructor = results['driver'][0]['Constructor']['constructorId'];//mapping.constructorMap[driverInfo['driverId']];

    console.log(results);

    let driverPoints = [];
    let teamMatePoints = [];
    for (let i = 0; i < results['driver'].length; i++) {
      if (results['driver'][i] === null) {
        driverPoints.push(0);
      } else {
        driverPoints.push(results['driver'][i]['points']);
      }
      
      if (results['teamMate'][i] === null) {
        teamMatePoints.push(0);
      } else {
        teamMatePoints.push(results['teamMate'][i]['points']);
      }
    };

    this._chart.data = {
      labels: raceNames,
      datasets: [{
        label: driverInfo['givenName'] + ' ' + driverInfo['familyName'],
        data: driverPoints,
        backgroundColor: mapping.constructorColors[constructor],
        borderColor: mapping.constructorColors[constructor],
        fill: 'false',
      },
      {
        label: results['teamMate'][0]['Driver']['givenName'] + ' ' 
             + results['teamMate'][0]['Driver']['familyName'],
        data: teamMatePoints,
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
