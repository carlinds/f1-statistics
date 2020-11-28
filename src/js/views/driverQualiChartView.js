import Chart from "chart.js";
import * as mapping from "../mapping.js";

class DriverQualiChartView {
  _ctx = document.getElementById("driver__quali__chart").getContext("2d");

  _chart = new Chart(this._ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      title: {
        display: true,
        text: "Qualifying position",
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
    const raceResults = dataset["raceResults"];
    const qualiResults = dataset["qualiResults"];
    const raceNames = dataset["raceNames"];
    const driverInfo = dataset["driverInfo"];
    const constructor =
      raceResults["driver"][0]["Constructor"]["constructorId"];

    let driverQualiPos = [];
    let teamMateQualiPos = [];
    for (let i = 0; i < qualiResults["driver"].length; i++) {
      for (let i = 0; i < qualiResults["driver"].length; i++) {
        if (qualiResults["driver"][i] === null) {
          driverQualiPos.push(null);
        } else {
          driverQualiPos.push(
            parseInt(
              qualiResults["driver"][i]["QualifyingResults"][0]["position"]
            )
          );
        }

        if (qualiResults["teamMate"][i] === null) {
          teamMateQualiPos.push(null);
        } else {
          teamMateQualiPos.push(
            parseInt(
              qualiResults["teamMate"][i]["QualifyingResults"][0]["position"]
            )
          );
        }
      }
    }

    this._chart.data = {
      labels: raceNames,
      datasets: [
        {
          label: driverInfo["givenName"] + " " + driverInfo["familyName"],
          data: driverQualiPos,
          backgroundColor: mapping.constructorColors[constructor],
          borderColor: mapping.constructorColors[constructor],
          fill: "false",
        },
        {
          label:
            raceResults["teamMate"][0]["Driver"]["givenName"] +
            " " +
            raceResults["teamMate"][0]["Driver"]["familyName"],
          data: teamMateQualiPos,
          backgroundColor: mapping.constructorColors[constructor],
          borderColor: mapping.constructorColors[constructor],
          borderDash: [5, 15],
          fill: "false",
        },
      ],
    };
    this._chart.update();
  }
}

export default new DriverQualiChartView();
