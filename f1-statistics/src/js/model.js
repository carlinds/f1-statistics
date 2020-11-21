import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

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
  const res = await fetch(`http://ergast.com/api/f1/${season}.json`);
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

  const driverPoints = await getDriverPoints(season, raceIndex, driverInfo['driverId']);

  return [driverPoints, raceNames, driverInfo];
};

const getDriverPoints = async function (season, raceIndex, driverId) {
  // Get driver standings for each race
  let driverPoints = [];
  for (let i = 0; i < raceIndex; i++) {
    let raceResults = await fetchRaceResults(season, i+1);
    let driverFound = false;

    for (let j = 0; j < raceResults.length; j++) {
      let driver = raceResults[j];
      if (driver['Driver']['driverId'] === driverId) {
        driverPoints.push(parseInt(driver.points));
        driverFound = true;
        break;
      }
    }

    if (!driverFound) {
      driverPoints.push(0);
    }
  }
  return driverPoints;
};

