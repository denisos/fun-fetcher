import React from 'react';

import './Character.css';

function Character(props) {
  const {
    person: {
      name,
      gender,
      eye_color,
      filmNames
    }
  } = props;

  return (
    <div className="person-card">
      <div className="person-picture"></div>
      <p>{name}</p>
      <p>{gender}</p>
      <p>{eye_color}</p>
      <p>{filmNames && filmNames.join(', ')}</p>
    </div>
  );
}

export default Character;
