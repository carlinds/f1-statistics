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
    let res = await fetch(
      `https://ergast.com/api/f1/current/last/results.json`
    );
    if (!res.ok) {
      throw new Error('Could not fetch race list.');
    }
    let data = await res.json();
    let round = data.MRData.RaceTable.round;

    raceIndex = round;
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

const getCumulativeConstructorStandings = async function (season, raceIndex) {
  // Get list of race names
  const res = await fetch(`http://ergast.com/api/f1/2020.json`);
  if (!res.ok) {
    throw new Error('Could not fetch race list.');
  }
  const seasonData = await res.json();

  // Get constructor standings for each race
  let raceList = [];
  let data = [];
  for (let i = 0; i < raceIndex; i++) {
    let standings = await fetchConstructorStandings(season, i + 1);
    data[i] = standings;
    raceList[i] = seasonData.MRData.RaceTable.Races[i]['raceName'];
  }

  return [data, raceList];
};

export const fetchConstructorStandings = async function (season, raceName) {
  try {
    const res = await fetch(
      `https://ergast.com/api/f1/${season}/${raceName}/constructorStandings.json`
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
