import Chart from 'chart.js';
import * as mapping from '../mapping.js';

class RaceChartView {
  _ctx = document.getElementById('race__chart').getContext('2d');

  _chart = new Chart(this._ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      title: {
        display: true,
        text: 'Constructor standings'
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
    // Clear data and labels
    this._chart.data = {
      labels: [],
      datasets: [],
    };

    this._chart.data.labels = dataset.races;
    for (const [key, value] of Object.entries(dataset['constructors'])) {
      this._chart.data.datasets.push({
        label: value.name,
        data: value.data,
        backgroundColor: mapping.constructorColors[key],
        borderColor: mapping.constructorColors[key],
        fill: 'false',
      });
    }

    this._chart.update();
  }
}

export default new RaceChartView();
