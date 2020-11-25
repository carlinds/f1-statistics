import Chart from 'chart.js';
import * as mapping from '../mapping.js';

class DriverQualiChartView {
  _ctx = document.getElementById('driver__quali__chart').getContext('2d');

  _chart = new Chart(this._ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      title: {
        display: true,
        text: 'Qualifying position'
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
    const constructor = raceResults['driver'][0]['Constructor']['constructorId'];

    let driverQualiPos = [];
    let teamMateQualiPos = [];
    for (let i = 0; i < raceResults['driver'].length; i++) {
      for (let i = 0; i < raceResults['driver'].length; i++) {
        if (raceResults['driver'][i] === null) {
          driverQualiPos.push(null);
        } else {
          driverQualiPos.push(raceResults['driver'][i]['grid']);
        }
        
        if (raceResults['teamMate'][i] === null) {
          teamMateQualiPos.push(null);
        } else {
          teamMateQualiPos.push(raceResults['teamMate'][i]['grid']);
        }
      };
    };

    this._chart.data = {
      labels: raceNames,
      datasets: [{
        label: driverInfo['givenName'] + ' ' + driverInfo['familyName'],
        data: driverQualiPos,
        backgroundColor: mapping.constructorColors[constructor],
        borderColor: mapping.constructorColors[constructor],
        fill: 'false',
      },
      {
        label: raceResults['teamMate'][0]['Driver']['givenName'] + ' ' 
             + raceResults['teamMate'][0]['Driver']['familyName'],
        data: teamMateQualiPos,
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

export default new DriverQualiChartView();
