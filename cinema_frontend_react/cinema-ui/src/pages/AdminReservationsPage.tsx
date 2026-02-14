import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Delete, Edit, Refresh } from "@mui/icons-material";
import {
  getReservations,
  saveReservations,
  deleteReservations,
  type Reservations,
} from "../api/reservations.api";

type DRFPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

// Helpers de fecha
function toDatetimeLocalValue(date: Date) {
  // YYYY-MM-DDTHH:MM (sin segundos)
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseDatetimeLocal(value: string): Date | null {
  // value: "YYYY-MM-DDTHH:MM"
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateDisplay(val: string | number): string {
  try {
    let d: Date;
    if (typeof val === "number") {
      // Si tu backend envía epoch en segundos, conviértelo:
      if (val < 10_000_000_000) d = new Date(val * 1000);
      else d = new Date(val);
    } else {
      d = new Date(val);
    }
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleString();
  } catch {
    return String(val);
  }
}

function StatusPill({ status }: { status: string }) {
  const s = (status || "").toLowerCase();
  let color: "default" | "success" | "warning" | "error" | "info" = "default";
  if (["confirmed", "confirmada", "activa"].includes(s)) color = "success";
  else if (["pending", "pendiente"].includes(s)) color = "warning";
  else if (["cancelled", "canceled", "cancelada"].includes(s)) color = "error";
  else color = "info";
  return <Chip size="small" label={status} color={color} variant="outlined" />;
}

type FormState = {
  id: number | null;
  customer_name: string;
  seats: number | "";
  status: string;
  created_at: string;
};

const EMPTY_FORM: FormState = {
  id: null,
  customer_name: "",
  seats: "",
  status: "pending",
  created_at: toDatetimeLocalValue(new Date()),
};

export default function AdminReservationsPage() {
  const [items, setItems] = useState<Reservations[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string>("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<Reservations | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((count || 0) / pageSize)),
    [count, pageSize]
  );

  const load = useCallback(async (targetPage = page) => {
    try {
      setLoading(true);
      setError("");
      const data = await getReservations();

      if (Array.isArray(data)) {
        setItems(data);
        setCount(data.length);
      } else {
        const paginated = data as DRFPaginated<Reservations>;
        setItems(paginated.results || []);
        setCount(typeof paginated.count === "number" ? paginated.count : (paginated.results?.length || 0));
      }
    } catch (e: any) {
      console.error(e);
      setError(
        e?.message?.includes("Network") || e?.message?.includes("Failed")
          ? "No se pudo conectar al backend."
          : e?.message || "Error al cargar las reservas."
      );
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(1); setPage(1); }, [load]);

  const handleRefresh = () => { load(page); };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setOpenForm(true);
  };

  const openEdit = (row: Reservations) => {
    let createdLocal = toDatetimeLocalValue(new Date());
    if (typeof row.created_at === "number") {
      const ms = row.created_at < 10_000_000_000 ? row.created_at * 1000 : row.created_at;
      createdLocal = toDatetimeLocalValue(new Date(ms));
    } else {
      const d = new Date(row.created_at as any);
      if (!isNaN(d.getTime())) createdLocal = toDatetimeLocalValue(d);
    }

    setForm({
      id: row.id,
      customer_name: row.customer_name,
      seats: row.seats,
      status: row.status,
      created_at: createdLocal,
    });
    setFormError("");
    setOpenForm(true);
  };

  const closeForm = () => setOpenForm(false);

  const handleFormChange = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!form.customer_name.trim()) return "El nombre del cliente es obligatorio.";
    const seats = Number(form.seats);
    if (!Number.isInteger(seats) || seats <= 0) return "Asientos debe ser entero positivo.";
    if (!form.status.trim()) return "Estado es obligatorio.";
    const dt = parseDatetimeLocal(form.created_at);
    if (!dt) return "Fecha/hora inválida.";
    return "";
  };

  const submitForm = async () => {
    const v = validateForm();
    if (v) {
      setFormError(v);
      return;
    }
    try {
      setFormError("");
      const dt = parseDatetimeLocal(form.created_at)!;
      const createdAtNumber = dt.getTime();

      await saveReservations(form.id, {
        customer_name: form.customer_name.trim(),
        seats: Number(form.seats),
        status: form.status,
        created_at: createdAtNumber,
      } as any);

      setOpenForm(false);
      await load(page);
    } catch (e: any) {
      console.error(e);
      setFormError(e?.message || "No se pudo guardar la reserva.");
    }
  };

  const openDeleteConfirm = (row: Reservations) => {
    setToDelete(row);
    setOpenConfirm(true);
  };
  const closeDeleteConfirm = () => setOpenConfirm(false);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteReservations(toDelete.id);
      setOpenConfirm(false);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
        await load(page - 1);
      } else {
        await load(page);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "No se pudo eliminar la reserva.");
    }
  };

  const handleChangePage = async (_: any, value: number) => {
    setPage(value);
    await load(value);
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Administrar Reservas</Typography>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Nueva</Button>
            <Tooltip title="Refrescar">
              <span>
                <IconButton onClick={handleRefresh} disabled={loading}><Refresh /></IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          {loading && <CircularProgress size={18} />}
          <Typography variant="body2" color="text.secondary">
            {count ? `${count} registro(s)` : loading ? "Cargando..." : "Sin resultados"}
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
              <TableCell align="center" width={120}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && items.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No hay datos</TableCell></TableRow>
            ) : (
              items.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.customer_name}</TableCell>
                  <TableCell align="right">{row.seats}</TableCell>
                  <TableCell><StatusPill status={row.status} /></TableCell>
                  <TableCell>{formatDateDisplay(row.created_at as any)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => openEdit(row)} aria-label="Editar"><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => openDeleteConfirm(row)} aria-label="Eliminar" color="error"><Delete fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Pagination count={totalPages} page={page} onChange={handleChangePage} size="small" />
        </Stack>
      </Paper>

      <Dialog open={openForm} onClose={closeForm} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? "Editar reserva" : "Nueva reserva"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Cliente"
              value={form.customer_name}
              onChange={(e) => handleFormChange("customer_name", e.target.value)}
              fullWidth
              required
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Asientos"
                type="number"
                inputProps={{ step: "1", min: 1 }}
                value={form.seats}
                onChange={(e) => handleFormChange("seats", e.target.value === "" ? "" : Number(e.target.value))}
                fullWidth
                required
              />
              <TextField
                label="Estado"
                select
                value={form.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                fullWidth
                required
              >
                <MenuItem value="pending">Pendiente</MenuItem>
                <MenuItem value="confirmed">Confirmada</MenuItem>
                <MenuItem value="cancelled">Cancelada</MenuItem>
              </TextField>
            </Stack>
            <TextField
              label="Creado (fecha/hora)"
              type="datetime-local"
              value={form.created_at}
              onChange={(e) => handleFormChange("created_at", e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm}>Cancelar</Button>
          <Button variant="contained" onClick={submitForm}>
            {form.id ? "Guardar cambios" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación eliminar */}
      <Dialog open={openConfirm} onClose={closeDeleteConfirm}>
        <DialogTitle>Eliminar reserva</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que deseas eliminar la reserva de <b>{toDelete?.customer_name}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}