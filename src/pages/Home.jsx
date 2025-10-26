import React from 'react';
import ListaPresentaciones from '../components/ListaPresentaciones';

const Home = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Tus Presentaciones</h2>
      <ListaPresentaciones />
    </div>
  );
};

export default Home;
