import './App.css';
import React from 'react';
// Importamos os componentes necessários para roteamento
import { Routes, Route } from 'react-router-dom'; 

// Importamos seus componentes
import AdminTool from './components/AdminTool';
import Tabela from './components/Tabela'; // O componente público

function App() {
  
  return (
    <div className="App">
      {/* O componente Routes monitora a URL */}
      <Routes>
        
        {/* Rota da Vitrine (pública) - Será acessada em http://localhost:5173/ */}
        <Route path="/" element={<Tabela />} /> 
        
        {/* Rota de Admin - Será acessada em http://localhost:5173/admin */}
        {/* Este componente será renderizado de forma confiável! */}
        <Route path="/admin" element={<AdminTool />} /> 
        
        {/* Opcional: Rota para páginas não encontradas (404) */}
        <Route path="*" element={<h1>Página Não Encontrada</h1>} />

      </Routes>
    </div>
  );
}

export default App;