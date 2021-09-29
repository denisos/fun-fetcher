import fwap from 'fwap';

export const getPersons = () => fwap.get('https://swapi.dev/api/people');

export const getForUrl = (url) => fwap.get(url);