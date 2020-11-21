'use strict';

import icons from './img/*.png';

const DOMStrings = {
  tableBody: '.table-body',
  searchButton: '#search__button',
  searchFields: {
    raceName: '#race__name',
  },
};

const init = function () {
  resetTable();
  getRaceEntries('2020');
  addEventListeners();
};

const resetTable = function () {
  document.querySelector(DOMStrings.tableBody).innerHTML = '';
};

const addEventListeners = function () {
  document
    .querySelector(DOMStrings.searchButton)
    .addEventListener('click', function () {
      resetTable();
      getRaceResults(
        '2020',
        document.querySelector(DOMStrings.searchFields.raceName).value
      );
    });
};

const getRaceEntries = async function (season) {
  try {
    const res = await fetch(`https://ergast.com/api/f1/${season}.json`);
    if (!res.ok) {
      throw new Error('Could not fetch race entries.');
    }

    const data = await res.json();
    const races = data.MRData.RaceTable.Races;

    if (!(Array.isArray(races) && races.length)) {
      throw new Error('No races found for specified season.');
    }
    renderRaceEntries(races);
  } catch (err) {
    console.error(err);
  }
};

const renderRaceEntries = function (data) {
  data.forEach(element => {
    const html = `
      <option value="${element.round}">${element.raceName}</option>
    `;

    document
      .querySelector(DOMStrings.searchFields.raceName)
      .insertAdjacentHTML('beforeend', html);
  });
  const lastHtml = '<option value="last" selected>Last race</option>';
  document
    .querySelector(DOMStrings.searchFields.raceName)
    .insertAdjacentHTML('afterbegin', lastHtml);
};

const getRaceResults = async function (season, raceName) {
  try {
    const res = await fetch(
      `https://ergast.com/api/f1/${season}/${raceName}/results.json`
    );
    if (!res.ok) {
      throw new Error('Could not fetch race results.');
    }

    const data = await res.json();
    const races = data.MRData.RaceTable.Races;

    if (!(Array.isArray(races) && races.length)) {
      throw new Error('No results found for specified race.');
    }
    renderRaceResults(races[0].Results);
  } catch (err) {
    console.error(err);
  }
};

const renderRaceResults = function (data) {
  data.forEach(element => {
    const img_name = element.Constructor.constructorId + '_logo';
    console.log(img_name);
    const html = `
      <tr>
          <td>${element.position}</td>
          <td>${element.Driver.givenName} ${element.Driver.familyName}</td>
          <td>${element.number}</td>
          <td><img src="${icons[img_name]}" class="constructor__logo"></img>${element.Constructor.name}</td>
          <td>${element.points}</td>
      </tr>
    `;

    document
      .querySelector(DOMStrings.tableBody)
      .insertAdjacentHTML('beforeend', html);
  });
};

init();

import Chart from 'chart.js';

var ctx = document.getElementById('chart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  },
});
