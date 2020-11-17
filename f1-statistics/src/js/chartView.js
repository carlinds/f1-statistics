import Chart from 'chart.js';

const constructorColors = {
  alfa: 'rgba(155, 0, 0, 0.8)',
  alphatauri: 'rgba(70, 155, 255, 0.8)',
  ferrari: 'rgba(220, 1, 1, 0.8)',
  haas: '	rgba(190, 159, 89, 0.8)',
  mclaren: 'rgba(255, 135, 0, 0.8)',
  mercedes: '	rgba(0, 210, 190, 0.8)',
  racing_point: 'rgba(245, 150, 200, 0.8)',
  red_bull: 'rgba(30, 65, 255, 0.8)',
  renault: 'rgba(255, 245, 0, 0.8)',
  williams: 'rgba(245, 245, 245, 0.8)',
};

class ChartView {
  _ctx = document.getElementById('chart').getContext('2d');

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
        backgroundColor: constructorColors[key],
        borderColor: constructorColors[key],
        fill: 'false',
      });
    }

    this._chart.update();
  }
}

export default new ChartView();
