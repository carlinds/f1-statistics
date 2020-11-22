import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';
import * as mapping from './mapping.js';

export const fetchRaceEntries = async function (season) {
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
    return races;
  } catch (err) {
    console.error(err);
  }
};

export const fetchRaceResults = async function (season, raceName) {
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
    return races[0].Results;
  } catch (err) {
    console.error(err);
  }
};

export const computeConstructorsDataset = async function (season, raceIndex) {
  // Hack to handle 'last' raceIndex
  if (raceIndex === 'last') {
    raceIndex = await getIndexOfLastRace();
  }

  const [
    cumulativeStandings,
    raceList,
  ] = await getCumulativeConstructorStandings(season, raceIndex);
  let dataset = {};
  dataset['races'] = raceList;
  dataset['constructors'] = {};

  // Get constructor id and name
  cumulativeStandings[0].forEach(element => {
    dataset['constructors'][element.Constructor.constructorId] = {
      name: element.Constructor.name,
      data: [],
    };
  });

  // Add data to dataset
  cumulativeStandings.forEach(race => {
    race.forEach(constructor => {
      dataset['constructors'][constructor.Constructor.constructorId][
        'data'
      ].push(constructor.points);
    });
  });

  return dataset;
};

const getIndexOfLastRace = async function () {
  let res = await fetch(
    `https://ergast.com/api/f1/current/last/results.json`
  );
  if (!res.ok) {
    throw new Error('Could not fetch race list.');
  }
  let data = await res.json();
  return data.MRData.RaceTable.round;
};

const getCumulativeConstructorStandings = async function (season, raceIndex) {
  const raceList = await getRaceList(season);

  // Get constructor standings for each race
  let data = [];
  let raceNames = [];
  for (let i = 0; i < raceIndex; i++) {
    let standings = await fetchConstructorStandings(season, i + 1);
    data[i] = standings;
    raceNames[i] = raceList[i].raceName;
  }

  return [data, raceNames];
};

const getRaceList = async function (season) {
  const res = await fetch(`https://ergast.com/api/f1/${season}.json`);
  if (!res.ok) {
    throw new Error('Could not fetch race list.');
  }
  const seasonData = await res.json();

  return seasonData.MRData.RaceTable.Races;
}

export const fetchConstructorStandings = async function (season, raceIndex) {
  try {
    const res = await fetch(
      `https://ergast.com/api/f1/${season}/${raceIndex}/constructorStandings.json`
    );
    if (!res.ok) {
      throw new Error('Could not fetch constructor standings.');
    }

    const data = await res.json();
    const standingsLists = data.MRData.StandingsTable.StandingsLists;

    if (!(Array.isArray(standingsLists) && standingsLists.length)) {
      throw new Error('No results found for specified race.');
    }

    return standingsLists[0].ConstructorStandings;
  } catch (err) {
    console.error(err);
  }
};

export const fetchDriverInfo = async function (driverId) {
  try {
    const res = await fetch(
      `https://ergast.com/api/f1/drivers/${driverId}.json`
    );
    if (!res.ok) {
      throw new Error('Could not fetch race results.');
    }

    const data = await res.json();

    return data.MRData.DriverTable.Drivers[0];
  } catch (err) {
    console.error(err);
  }
};

export const computeDriverDataset = async function (season, raceIndex, driverInfo) {
  // Hack to handle 'last' raceIndex
  if (raceIndex === 'last') {
    raceIndex = await getIndexOfLastRace();
  }

  const raceList = await getRaceList(season);
  let raceNames = [];
  for (let i = 0; i < raceIndex; i++) {
    raceNames[i] = raceList[i].raceName;
  }

  const driverRaceResults = await getDriverRaceResults(season, raceIndex, driverInfo);

  return {'results': driverRaceResults,
          'raceNames': raceNames,
          'driverInfo': driverInfo};
};

const getDriverRaceResults = async function (season, raceIndex, driverInfo) {
  const driverId = driverInfo['driverId'];
  const constructor = mapping.constructorMap[driverInfo['driverId']];

  let driver = {
    points: [],
    startPos: [],
    finishPos: [],
  }

  let teamMate = {
    id: [],
    name: [],
    points: [],
    startPos: [],
    finishPos: [],
  }

  let beatTeamMate = {
    race: [],
    quali: [],
  }

  // Loop over races
  for (let i = 0; i < raceIndex; i++) {
    let raceResults = await fetchRaceResults(season, i+1);
    let driverFound = false;
    let teamMateFound = false;

    // Loop over drivers
    for (let j = 0; j < raceResults.length; j++) {
      let currDriver = raceResults[j];
      let currDriverId = currDriver['Driver']['driverId'];

      if (mapping.constructorMap[currDriverId] === constructor) {
        if (currDriverId === driverId) {
          driver['points'].push(parseInt(currDriver.points));
          driver['finishPos'].push(parseInt(currDriver.position));
          driver['startPos'].push(parseInt(currDriver.grid));
          driverFound = true;
        } else {
          teamMate['name'].push(currDriver['Driver']['givenName'] + ' ' + currDriver['Driver']['familyName']);
          teamMate['id'].push(currDriverId);
          teamMate['points'].push(parseInt(currDriver.points));
          teamMate['finishPos'].push(parseInt(currDriver.position));
          teamMate['startPos'].push(parseInt(currDriver.grid));
          teamMateFound = true;
        }
      }
    }

    // Special case when driver not in race
    if (!driverFound) {
      driver['points'].push(0);
      driver['finishPos'].push(null);
      driver['startPos'].push(null);
    }
    if (!teamMateFound) {
      teamMate['id'].push(null);
      teamMate['points'].push(0);
      teamMate['finishPos'].push(null);
      teamMate['startPos'].push(null);
    }

    beatTeamMate['race'].push(driver['finishPos'][i] < teamMate['finishPos'][i]);
    beatTeamMate['quali'].push(driver['startPos'][i] < teamMate['startPos'][i]);
  }
  return {'driver': driver,
          'teamMate': teamMate,
          'beatTeamMate': beatTeamMate};
};

