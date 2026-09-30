import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LobbyPage } from '@/modules/lobby/LobbyPage';
import { GamePage } from '@/modules/game/GamePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/room/:id" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
