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

export const fetchQualiResults = async function (season, driverId) {
  try {
    const res = await fetch(
      `https://ergast.com/api/f1/${season}/drivers/${driverId}/qualifying.json`
    );
    if (!res.ok) {
      throw new Error('Could not fetch race results.');
    }

    const data = await res.json();
    const races = data.MRData.RaceTable.Races;

    if (!(Array.isArray(races) && races.length)) {
      throw new Error('No results found for specified race.');
    }
    return races;
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

  // Get team mate id
  let driverId = driverInfo['driverId'];
  let teamMateId = null;
  for (let key in mapping.constructorMap) {
    if ((mapping.constructorMap[key] === mapping.constructorMap[driverId])
       && (key !== driverId)) {
        teamMateId = key;
    }
  }

  // Get race and quali results
  const raceResults = await getDriverRaceResults(season, raceIndex, driverId, teamMateId);
  const qualiResults = await getDriverQualiResults(season, driverId, teamMateId);

  const raceList = await getRaceList(season);
  let raceNames = [];
  let fantasyPoints = [];
  for (let i = 0; i < raceIndex; i++) {
    raceNames[i] = raceList[i].raceName;

    // Handle missing races
    if (qualiResults['driver'][i]['raceName'] !== raceNames[i]) {
      qualiResults['driver'].splice(i, 0, null);
    }
    if (qualiResults['teamMate'][i]['raceName'] !== raceNames[i]) {
      qualiResults['teamMate'].splice(i, 0, null);
    }

    // Calculate fantasy points
    fantasyPoints.push(calculateFantasyPoints(
      raceResults['driver'][i], raceResults['teamMate'][i],
      qualiResults['driver'][i], qualiResults['teamMate'][i]));
  }

  return {'raceResults': raceResults,
          'qualiResults': qualiResults,
          'raceNames': raceNames,
          'driverInfo': driverInfo,
          'fantasyPoints': fantasyPoints};
};

const getDriverQualiResults = async function (season, driverId, teamMateId) {
  const driverQualiResults = await fetchQualiResults(season, driverId);
  const teamMateQualiResults = await fetchQualiResults(season, teamMateId);

  return {'driver': driverQualiResults,
          'teamMate': teamMateQualiResults};
};

const getDriverRaceResults = async function (season, raceIndex, driverId, teamMateId) {
  let driver = [];
  let teamMate = [];

  // Loop over races
  for (let i = 0; i < raceIndex; i++) {
    let raceResults = await fetchRaceResults(season, i+1);
    let driverFound = false;
    let teamMateFound = false;

    // Loop over drivers
    for (let j = 0; j < raceResults.length; j++) {
      let currDriver = raceResults[j];
      let currDriverId = currDriver['Driver']['driverId'];

      if (currDriverId === driverId) {
        driver.push(currDriver);
        driverFound = true;
      } 
      if (currDriverId === teamMateId) {
        teamMate.push(currDriver);
        teamMateFound = true;
      }
    }

    // Special case when driver not in race
    if (!driverFound) {
      driver.push(null);
    }
    if (!teamMateFound) {
      teamMate.push(null);
    }
  }
  return {'driver': driver,
          'teamMate': teamMate};
};

const calculateFantasyPoints = function(driverRes, teamMateRes, driverQualy, teamMateQualy) {
  let fantasyPoints = 0;

  // Driver not in race
  if ((driverRes === null) || (driverQualy === null)) {
    return fantasyPoints;
  }

  let teamMateFinishPos;
  if (teamMateRes === null) {
    // Team mate not in race
    teamMateFinishPos = 21;
  } else {
    teamMateFinishPos = teamMateRes['position'];
  }

  let teamMateQualyPos;
  if (teamMateQualy === null) {
    // Team mate not in race
    teamMateQualyPos = 21;
  } else {
    teamMateQualyPos = parseInt(teamMateQualy['QualifyingResults'][0]['position']);
  }

  const driverQualyPos = parseInt(driverQualy['QualifyingResults'][0]['position']);
  const startPos = (driverRes['grid'] !== '0') ? parseInt(driverRes['grid']) : 20;
  const finishPos = parseInt(driverRes['position']);
  let fastestLap = false;
  if ('FastestLap' in driverRes) {fastestLap = (driverRes['FastestLap']['rank'] === '1');}
  

  // -------------------------- Qualifying --------------------------
  // Quali position bonus
  fantasyPoints += Math.max(11 - driverQualyPos, 0);

  // Q3
  if ('Q3' in driverQualy['QualifyingResults'][0]) {
    fantasyPoints += 3;
  }
  // Q2
  else if ('Q2' in driverQualy['QualifyingResults'][0]) {
    fantasyPoints += 2;
  }
  // Q1
  else  {
    fantasyPoints += 1;
  }

  // Beat team mate in qualy
  if (driverQualyPos < teamMateQualyPos) {
    fantasyPoints += 2;
  }

  //TODO: Add penalties from disqualification
  // - Did not qualify 
  // - Disqualification from qualifying

  // -------------------------- Race --------------------------

  // Finishing position bonus
  if (finishPos < 11) {
    fantasyPoints += mapping.pointsTable[finishPos];
  }

  // Finished race
  if (driverRes['positionText'] !== 'R' ) {
    fantasyPoints += 1

    // Positions gained
    fantasyPoints += Math.min(Math.max(startPos - finishPos, 0) * 2, 10);

    // Lost positions
    if (startPos < 11) {
      fantasyPoints -=  Math.min(Math.max(finishPos - startPos, 0) * 2, 10);
    } 
    else 
    {
      fantasyPoints -=  Math.min(Math.max(finishPos - startPos, 0) * 1, 5);
    }
  }

  // Beat team mate race
  if (finishPos < teamMateFinishPos) {
    fantasyPoints += 3;
  }

  // Fastest lap
  if (fastestLap) {
    fantasyPoints += 5;
  }

  // Retired
  if (driverRes['positionText'] === 'R') {
    fantasyPoints -= 15;
  }

  //TODO: Add penalties

  return fantasyPoints;
};
