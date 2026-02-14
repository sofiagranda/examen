import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { getShows, type Shows } from "../api/shows.api";

type DRFPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export default function PublicShowsPage() {
  const [items, setItems] = useState<Shows[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Soporte de paginación si el backend lo expone
  const [page, setPage] = useState(1);
  const [count, setCount] = useState<number | null>(null); // null => no paginado
  const pageSize = 10; // Ajusta esto según la paginación de tu backend si lo sabes

  const load = useCallback(async (targetPage = page) => {
    try {
      setError("");
      setLoading(true);

      // NOTA: tu getShows() no recibe page; si necesitas página,
      // agrega un parámetro en la API (e.g., getShows(page)) y pásalo aquí.
      const data = await getShows();

      // Tu getShows() actualmente retorna "res.data.results || res.data"
      // Por eso aquí detectamos si vino paginado o lista plana:
      if (Array.isArray(data)) {
        // Lista plana (no paginado)
        setItems(data);
        setCount(null);
      } else {
        // Asumir que es DRF paginado si tiene "results"
        const paginated = data as DRFPaginated<Shows>;
        setItems(paginated.results || []);
        setCount(typeof paginated.count === "number" ? paginated.count : null);
      }
    } catch (e: any) {
      console.error(e);
      setError(
        e?.message?.includes("Failed to fetch")
          ? "No se pudo conectar al backend. ¿Está encendido?"
          : e?.message || "No se pudo cargar la lista pública de shows."
      );
      setItems([]);
      setCount(null);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load(1);
  }, [load]);

  const handleRefresh = () => {
    setPage(1);
    load(1);
  };

  // Si count !== null asumimos que hay paginación DRF
  const isPaginated = count !== null;
  const totalPages = isPaginated
    ? Math.max(1, Math.ceil((count ?? 0) / pageSize))
    : 1;

  const handleChangePage = async (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);

    // Si tu API soporta paginación por query (e.g., ?page=N),
    // debes modificar getShows para aceptar page y usarlo aquí:
    // await load(value);
    await load(value);
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5">Lista de Shows (Público)</Typography>
          <Button variant="outlined" onClick={handleRefresh} disabled={loading}>
            {loading ? "Cargando..." : "Refrescar"}
          </Button>
        </Stack>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          {loading && <CircularProgress size={20} />}
          <Typography variant="body2" color="text.secondary">
            {isPaginated
              ? (count ?? 0) > 0
                ? `${count} registro(s) encontrado(s)`
                : loading
                ? "Cargando..."
                : "Sin resultados"
              : items.length > 0
              ? `${items.length} registro(s)`
              : loading
              ? "Cargando..."
              : "Sin resultados"}
          </Typography>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Sala</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="right">Asientos disponibles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay shows para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.movie_title}</TableCell>
                  <TableCell>{s.room}</TableCell>
                  <TableCell align="right">{s.price}</TableCell>
                  <TableCell align="right">{s.available_seats}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {isPaginated && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handleChangePage}
              size="small"
              color="primary"
            />
          </Stack>
        )}
      </Paper>
    </Container>
  );
}