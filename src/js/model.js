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

  const raceResults = await getDriverRaceResults(season, raceIndex, driverInfo);

  return {'results': raceResults,
          'raceNames': raceNames,
          'driverInfo': driverInfo};
};

const getDriverRaceResults = async function (season, raceIndex, driverInfo) {
  const driverId = driverInfo['driverId'];
  const constructor = mapping.constructorMap[driverInfo['driverId']];

  let driver = [];
  let teamMate = [];
  let fantasyPoints = [];

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
          driver.push(currDriver);
          driverFound = true;
        } else {
          teamMate.push(currDriver);
          teamMateFound = true;
        }
      }
    }

    // Special case when driver not in race
    if (!driverFound) {
      driver.push(null);
    }
    if (!teamMateFound) {
      teamMate.push(null);
    }

    fantasyPoints.push(calculateFantasyPoints(driver[i], teamMate[i]));
  }
  return {'driver': driver,
          'teamMate': teamMate,
          'fantasyPoints': fantasyPoints};
};

const calculateFantasyPoints = function(driver, teamMate) {
  let fantasyPoints = 0;

  if (driver === null) {
    return;
  }

  let teamMateStartPos, teamMateFinishPos;
  if (teamMate === null) {
    teamMateStartPos = 21;
    teamMateFinishPos = 21;
  } else {
    teamMateStartPos = teamMate['grid'];
    teamMateFinishPos = teamMate['position'];
  }

  const startPos = driver['grid'];
  const finishPos = driver['position'];
  let fastestLap = false;
  if ('FastestLap' in driver) {fastestLap = (driver['FastestLap']['rank'] === 1);}
  

  // Qualifying

  // Quali position bonus
  fantasyPoints += Math.max(11 - startPos, 0);

  // Q3
  if (startPos < 11) {
    fantasyPoints += 3;
  }
  // Q2
  else if (startPos < 16) {
    fantasyPoints += 2;
  }
  // Q1
  else  {
    fantasyPoints += 1;
  }

  // Beat team mate
  if (startPos < teamMateStartPos) {fantasyPoints += 2};

  //TODO: Add penalties from disqualification


  // Race

  // Finishing position bonus
  if (finishPos < 11) {
    fantasyPoints += mapping.pointsTable[finishPos];
  }

  //TODO: Add point for finished race

  //TODO: Add points for fastest lap
  if (fastestLap) {fantasyPoints += 5};

  // Positions gained
  fantasyPoints += Math.min(Math.max(startPos - finishPos, 0) * 2, 10);

  // Beat team mate
  if (finishPos < teamMateFinishPos) {fantasyPoints += 3};

  //TODO: Add penalties


  return fantasyPoints;
};
