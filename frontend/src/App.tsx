import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { JoinPage } from './pages/JoinPage';
import { DraftRoom } from './pages/DraftRoom';

function App() {
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
