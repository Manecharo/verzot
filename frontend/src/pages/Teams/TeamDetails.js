import React from 'react';
import { useParams } from 'react-router-dom';

const TeamDetails = () => {
  const { id } = useParams();
  return <div><h1>Team Details: {id}</h1>{/* Team details content here */}</div>;
};

export default TeamDetails; 