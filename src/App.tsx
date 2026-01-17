import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./app/AppShell";
import SettlementsPage from "./pages/SettlementsPage";
import GamesPage from "./pages/GamesPage";
import ProfilePage from "./pages/ProfilePage";
import SettlementDetailPage from "./pages/SettlementDetailPage";


export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/settlements" replace />} />
        <Route path="/settlements" element={<SettlementsPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settlements/:groupId" element={<SettlementDetailPage />} />
      </Route>
    </Routes>
  );
}

