import * as model from './model.js';
import tableView from './tableView.js';
import chartView from './chartView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

const season = 2020;

const controlRaceEntries = function () {
  model
    .fetchRaceEntries(season)
    .then(races => tableView.renderRaceEntries(races));
};

const controlRaceResults = function () {
  model
    .fetchRaceResults(season, tableView._searchFieldElement.value)
    .then(raceResults => tableView.renderRaceResults(raceResults));

  model
    .computeConstructorsDataset(season, tableView._searchFieldElement.value)
    .then(dataset => chartView.renderDataset(dataset));
};

const controlDriverInfo = function () {
  let selectedDriver = document.querySelector('.selected-row');
  console.log(selectedDriver);
};

const init = function () {
  tableView.init();

  // TODO: Add this as handler when season is a search option
  controlRaceEntries();

  tableView.addHandlerSearch(controlRaceResults);
  tableView.addHandlerDriverSelection(controlDriverInfo);
};

init();

model.fetchDriverInfo('alonso');
