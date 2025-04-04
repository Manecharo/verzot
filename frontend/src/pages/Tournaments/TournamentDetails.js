import React from 'react';
import { useParams } from 'react-router-dom';

const TournamentDetails = () => {
  const { id } = useParams();
  return <div><h1>Tournament Details: {id}</h1>{/* Tournament details content here */}</div>;
};

export default TournamentDetails; 