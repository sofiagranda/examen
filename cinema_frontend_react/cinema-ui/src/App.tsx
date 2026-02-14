import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";

import HomePage from "./pages/HomePage";
import PublicShowsPage from "./pages/PublicShowsPage";
import PublicReservationsPage from "./pages/PublicReservationsPage";
import LoginPage from "./pages/LoginPage";
// import AdminMarcasPage from "./pages/AdminMarcasPage";
// import AdminVehiculosPage from "./pages/AdminVehiculosPage";

import { AuthProvider, useAuth } from "./context/AuthContext";
import StaffRoute from "./components/StaffRoute";
import AdminShowsPage from "./pages/AdminShowsPage";
import AdminReservationsPage from "./pages/AdminReservationsPage";

function TopBar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          CINEMA
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/show">Shows</Button>
          <Button color="inherit" component={Link} to="/reservation">Reservations</Button>

          {user?.is_staff && (
            <>
              <Button color="inherit" component={Link} to="/admin/shows">Admin Shows</Button>
              <Button color="inherit" component={Link} to="/admin/reservation">Admin Reservations</Button>
            </>
          )}

          {token ? (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TopBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/show" element={<PublicShowsPage />} />
          <Route path="/reservation" element={<PublicReservationsPage />} />
          <Route path="/login" element={<LoginPage />} />

          
          <Route
            path="/admin/shows"
            element={
              <StaffRoute>
                <AdminShowsPage />
              </StaffRoute>
            }
          />
          <Route
            path="/admin/reservation"
            element={
              <StaffRoute>
                <AdminReservationsPage />
              </StaffRoute>
            }
          />
         

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}