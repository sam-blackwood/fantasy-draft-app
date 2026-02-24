import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JoinPage } from './pages/JoinPage';
import { DraftRoom } from './pages/DraftRoom';
import { useLocalStore } from './store/localStore';

function App() {
  const theme = useLocalStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JoinPage />} />
        <Route path="/draft" element={<DraftRoom />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
