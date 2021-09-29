import React from 'react';

import Character from './Character';

import './CharactersList.css';
import useGetPersons from '../hooks/useGetPersons';

function CharactersList() {
  const { persons, status } = useGetPersons();

  if (status === 'loading') {
    return <p>loading....</p>
  }

  if (status === 'error') {
    return <p>Error happened!</p>
  }

  return (
    <ul>
      {persons && persons.map((person, index) => (
        <li>
          <Character person={person} key={index}/>
        </li>
      ))}
    </ul>
  );
}

export default CharactersList;
