import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { LobbyPage } from '@/pages/LobbyPage';
import { GamePage } from '@/pages/GamePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<LobbyPage />} /> */}
        <Route path="/room/:id" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
