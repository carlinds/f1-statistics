import * as model from "./model.js";
import tableView from "./views/tableView.js";
import raceChartView from "./views/raceChartView.js";
import driverRaceChartView from "./views/driverRaceChartView.js";
import driverQualiChartView from "./views/driverQualiChartView.js";
import driverView from "./views/driverView.js";

import "core-js/stable";
import "regenerator-runtime/runtime";
import { async } from "regenerator-runtime";

const season = 2020;
class Controller {

  controlRaceEntries() {
    model
      .fetchRaceEntries(season)
      .then((races) => tableView.renderRaceEntries(races));
  };
  
  controlRaceResults() {
    model
      .fetchRaceResults(season, tableView._searchFieldElement.value)
      .then((raceResults) => tableView.renderRaceResults(raceResults));
  
    model
      .computeConstructorsDataset(season, tableView._searchFieldElement.value)
      .then((dataset) => raceChartView.renderDataset(dataset));
  };
  
  controlDriverInfo() {
    model.fetchDriverInfo(document.querySelector('.selected-row').id)
    .then((driverInfo) => {
      return model.computeDriverDataset(season, 'last', driverInfo);
    })
    .then((dataset) => {
      driverView.renderDriverInfo(dataset['driverInfo']);
      driverView.renderFantasyPoints(dataset);
      driverRaceChartView.renderDataset(dataset);
      driverQualiChartView.renderDataset(dataset);
    });
  };
  
  init() {
    tableView.init();
  
    // TODO: Add this as handler when season is a search option
    this.controlRaceEntries();
  
    tableView.addHandlerSearch(this.controlRaceResults);
    tableView.addHandlerDriverSelection(this.controlDriverInfo);
  };
}

const controller = new Controller();
controller.init();
