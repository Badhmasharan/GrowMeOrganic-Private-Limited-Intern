import React from 'react';
import ArtworksTable from './components/ArtworksTable';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1 className='heading'>Artworks Table</h1>
      <ArtworksTable />
    </div>
  );
};

export default App;
