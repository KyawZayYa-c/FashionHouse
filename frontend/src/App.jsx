import React from 'react';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <div>
      <h2 className="text-center bg-gray-200 p-4">Main App Layout</h2>
    
      <Outlet /> 
    </div>
  );
}

export default App;