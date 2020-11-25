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
    const raceResults = dataset['raceResults'];
    const raceNames = dataset['raceNames'];
    const driverInfo = dataset['driverInfo'];
    const constructor = raceResults['driver'][0]['Constructor']['constructorId'];//mapping.constructorMap[driverInfo['driverId']];

    let driverPoints = [];
    let teamMatePoints = [];
    for (let i = 0; i < raceResults['driver'].length; i++) {
      if (raceResults['driver'][i] === null) {
        driverPoints.push(0);
      } else {
        driverPoints.push(raceResults['driver'][i]['points']);
      }
      
      if (raceResults['teamMate'][i] === null) {
        teamMatePoints.push(0);
      } else {
        teamMatePoints.push(raceResults['teamMate'][i]['points']);
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
        label: raceResults['teamMate'][0]['Driver']['givenName'] + ' ' 
             + raceResults['teamMate'][0]['Driver']['familyName'],
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
