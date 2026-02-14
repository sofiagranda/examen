import { useState } from "react";
import {
  Container, Paper, Stack, TextField, Button, Typography, Alert, CircularProgress,
} from "@mui/material";
import { loginApi } from "../api/auth.api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginApi(username.trim(), password);
      // Guardar token + user (incluye is_staff) en el AuthContext
      login({
        token: res.token,
        user: {
          id: res.user_id,
          username: res.username,
          email: res.email,
          is_staff: res.is_staff,
        },
      });
      navigate("/"); // o a "/show"
    } catch (err: any) {
      console.error(err);
      const status = err?.response?.status;
      setError(
        status === 400 || status === 401
          ? "Credenciales inválidas."
          : "No se pudo iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Iniciar sesión</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              fullWidth
            />
            <TextField
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} color="inherit" /> : "Entrar"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}