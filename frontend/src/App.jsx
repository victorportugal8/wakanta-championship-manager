import './App.css'
import AdminTool from './components/AdminTool'
import Tabela from './components/Tabela';

function App() {
  // Você pode usar roteamento para proteger esta tela
  const isAdmin = window.location.pathname === '/admin';

  return (
    <>
      {isAdmin ? <AdminTool /> : <h1><Tabela /></h1>}
    </>
  )
}

export default App