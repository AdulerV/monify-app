import React from 'react';
import 'bootswatch/dist/pulse/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'toastr/build/toastr.min';
import 'toastr/build/toastr.css';
import './custom.css';
import Rotas from './rotas.js';

function App() {
  return (
    <div className='container'>
      <Rotas />
    </div>
  );
}

export default App;
