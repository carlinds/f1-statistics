import * as model from "./model.js";
import tableView from "./tableView.js";
import raceChartView from "./raceChartView.js";
import driverChartView from "./driverChartView.js";
import driverView from "./driverView.js";

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
      driverView.renderDriverInfo(driverInfo);
      return model.computeDriverDataset(season, 'last', driverInfo);
    })
    .then((dataset) => driverChartView.renderDataset(dataset));
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
