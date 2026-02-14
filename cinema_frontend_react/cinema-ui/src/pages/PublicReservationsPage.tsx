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
  Chip,
  Pagination,
} from "@mui/material";
import { getReservations, type Reservations } from "../api/reservations.api";

type DRFPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function formatDate(value: string | number): string {
  // Si tu API envía ISO string: "2026-02-13T23:59:59Z", esto funciona directo.
  // Si envía número epoch en segundos, descomenta la línea para convertir a ms:
  // if (typeof value === "number" && value < 10_000_000_000) value = value * 1000;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleString(); // Ajusta locale/format si quieres
  } catch {
    return String(value);
  }
}

function StatusPill({ status }: { status: string }) {
  const normalized = (status || "").toLowerCase();
  let color: "default" | "success" | "warning" | "error" | "info" = "default";

  if (["confirmed", "confirmada", "activa"].includes(normalized)) color = "success";
  else if (["pending", "pendiente"].includes(normalized)) color = "warning";
  else if (["cancelled", "canceled", "cancelada"].includes(normalized)) color = "error";
  else color = "info";

  return <Chip size="small" label={status} color={color} variant="outlined" />;
}

export default function PublicReservationsPage() {
  const [items, setItems] = useState<Reservations[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Paginación opcional: si el backend devuelve "count"
  const [page, setPage] = useState(1);
  const [count, setCount] = useState<number | null>(null);
  const pageSize = 10; // Ajusta según tu DRF PAGE_SIZE si lo conoces

  const load = useCallback(async (targetPage = page) => {
    try {
      setError("");
      setLoading(true);

      // Nota: tu getReservations() no recibe page. Si quieres paginar,
      // actualiza la API para aceptar "?page=" y pásalo aquí.
      const data = await getReservations();

      if (Array.isArray(data)) {
        // Lista plana
        setItems(data);
        setCount(null);
      } else {
        // DRF paginado
        const paginated = data as DRFPaginated<Reservations>;
        setItems(paginated.results || []);
        setCount(typeof paginated.count === "number" ? paginated.count : null);
      }
    } catch (e: any) {
      console.error(e);
      setError(
        e?.message?.includes("Failed to fetch")
          ? "No se pudo conectar al backend. ¿Está encendido?"
          : e?.message || "No se pudo cargar la lista pública de reservas."
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

  const isPaginated = count !== null;
  const totalPages = isPaginated ? Math.max(1, Math.ceil((count ?? 0) / pageSize)) : 1;

  const handleChangePage = async (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    // Cuando agregues soporte a page en la API (getReservations(page)), pasa "value" al load
    await load(value);
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5">Reservas (Público)</Typography>
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
              <TableCell>Cliente</TableCell>
              <TableCell align="right">Asientos</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Creado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No hay reservas para mostrar.
                </TableCell>
              </TableRow>
            ) : (
              items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.customer_name}</TableCell>
                  <TableCell align="right">{r.seats}</TableCell>
                  <TableCell><StatusPill status={r.status} /></TableCell>
                  <TableCell>{formatDate(r.created_at as unknown as string)}</TableCell>
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