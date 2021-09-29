import { useState, useEffect , useReducer} from 'react';
import { getPersons, getForUrl } from '../api/api.js';

const filmsCache = new Map();

// return array of promises for all films to be fetched (not in cache)
function getFilms(persons) {
  let allUncachedFilmPromises = persons.reduce((accumulator, person) => {
    let personUncachedFilmPromises = person.films.reduce((accum, filmUrl) => {
      if (filmsCache.get(filmUrl)) {
        console.log("cache hit ", filmUrl)
      } else {
        const filmPromise = getForUrl(filmUrl)
        filmsCache.set(filmUrl, filmPromise);
        console.log("cache miss, fetching ", filmUrl)
        accum.push(filmPromise);
      }
      return accum;
    }, []);

    return accumulator.concat(personUncachedFilmPromises)
  }, []);  

  return allUncachedFilmPromises;
}

async function getAndCacheFilms(persons) {
  // get films promises, once loaded then upate cache
  const filmPromises = getFilms(persons);

  console.log("fetching films, filmPromises.length ", filmPromises.length)

  const filmsData = await Promise.all(filmPromises);

  // add films fetched to cache
  filmsData.forEach(film => {
    console.log(film.title)
    filmsCache.set(film.url, film);
  });
  
  // return from async function is always a promise, so same as: return Promise.resolve(); 
  return;  
}

// update each person with their film names
function updatePersonsWithFilms(persons, filmsCache) {
  // update persons with film names from cache
  const newPersons = persons.map(person => {
    const filmNames = person.films.reduce((accumuluator, filmUrl) => {
      const cacheEntry = filmsCache.get(filmUrl);
      if (cacheEntry) {
        accumuluator.push(cacheEntry.title)
      }
      return accumuluator;
    }, []);

    return { ...person, filmNames}
  });

  return newPersons;
}

function personsReducer(state, action) {
  switch (action.type) {
    case 'update.persons': 
      return [...action.persons];
    case 'update.personsfilms': 
      // return updated state with of persons with film names
      const newPersons = updatePersonsWithFilms(state, action.filmsCache);
      return newPersons;
    default:
      throw new Error('unknown action type');
  }
}

function useGetPersons() {
  const [persons, setPersons] = useState([]);
  const [status, setStatus] = useState();

  const [state, dispatch] = useReducer(personsReducer, []);

  useEffect(() => {
    // can't make useEffect async so use IIFE 
    (async function getPeople() {
      try {
        setStatus('loading');

        // step 1. fetch people and show results once fetched (early feedback)
        const resj = await getPersons();
        const personsData = resj.results;
        setPersons(personsData);
        setStatus('done');

        dispatch({ type: 'update.persons', persons: personsData });
        console.log("person fetched reducer state ", state);

        console.log("fetched persons ", personsData)

        // setp 2. fetch peoples films and update state once done
        //   get films promises, once loaded then upate cache
        await getAndCacheFilms(personsData);

        // update persons with film names from cache
        const newPersons = updatePersonsWithFilms(personsData, filmsCache);

        dispatch({ type: 'update.personsfilms', filmsCache: filmsCache });
        console.log("person updated with fils reducer state ", state);

        console.log("new persons", newPersons);

        setPersons(newPersons);

      } catch(err) {
        console.log("getPeople fetching exception ", err)
        setStatus('error');
      }
    }());

  }, []);

  return {
    persons,
    status,
    state  
  }
}

export default useGetPersons;
