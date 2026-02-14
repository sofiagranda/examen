import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField,
  Typography,
  CircularProgress,
  Pagination,
  Tooltip,
  Alert,
} from "@mui/material";
import { Add, Delete, Edit, Refresh } from "@mui/icons-material";
import { getShows, saveShows, deleteShows, type Shows } from "../api/shows.api";

type DRFPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

type FormState = {
  id: number | null;
  movie_title: string;
  room: string;
  price: number | 0;
  available_seats: number | 0;
};

const EMPTY_FORM: FormState = {
  id: null,
  movie_title: "",
  room: "",
  price: 0,
  available_seats: 0,
};

export default function AdminShowsPage() {
  const [items, setItems] = useState<Shows[]>([]);
  const [count, setCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const pageSize = 10; 

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string>("");

  const [openConfirm, setOpenConfirm] = useState(false);
  const [toDelete, setToDelete] = useState<Shows | null>(null);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((count || 0) / pageSize)),
    [count, pageSize]
  );

  const load = useCallback(async (targetPage = page) => {
    try {
      setLoading(true);
      setError("");

      const data = await getShows(targetPage);
      const paginated = data as DRFPaginated<Shows>;
      const results = Array.isArray(paginated.results) ? paginated.results : (data as any);

      setItems(results || []);
      setCount(typeof paginated.count === "number" ? paginated.count : (results?.length || 0));
    } catch (e: any) {
      console.error(e);
      setError(
        e?.message?.includes("Network") || e?.message?.includes("Failed")
          ? "No se pudo conectar al backend."
          : e?.message || "Error al cargar los shows."
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

  const openEdit = (row: Shows) => {
    setForm({
      id: row.id,
      movie_title: row.movie_title,
      room: row.room,
      price: row.price,
      available_seats: row.available_seats,
    });
    setFormError("");
    setOpenForm(true);
  };

  const closeForm = () => setOpenForm(false);

  const handleFormChange = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!form.movie_title.trim()) return "El título es obligatorio.";
    if (!form.room.trim()) return "La sala es obligatoria.";
    const price = Number(form.price);
    if (isNaN(price) || price < 0) return "Precio inválido.";
    const seats = Number(form.available_seats);
    if (!Number.isInteger(seats) || seats < 0) return "Asientos inválidos.";
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
      await saveShows(form.id, {
        movie_title: form.movie_title.trim(),
        room: form.room.trim(),
        price: Number(form.price),
        available_seats: Number(form.available_seats),
      });
      setOpenForm(false);
      await load(page);
    } catch (e: any) {
      console.error(e);
      setFormError(e?.message || "No se pudo guardar el show.");
    }
  };

  const openDeleteConfirm = (row: Shows) => {
    setToDelete(row);
    setOpenConfirm(true);
  };
  const closeDeleteConfirm = () => setOpenConfirm(false);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteShows(toDelete.id);
      setOpenConfirm(false);
      if (items.length === 1 && page > 1) {
        setPage(page - 1);
        await load(page - 1);
      } else {
        await load(page);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "No se pudo eliminar el show.");
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
          <Typography variant="h6">Administrar Shows</Typography>
          <Stack direction="row" spacing={1}>
            <Button startIcon={<Add />} variant="contained" onClick={openCreate}>Nuevo</Button>
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
              <TableCell>Título</TableCell>
              <TableCell>Sala</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="right">Asientos</TableCell>
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
                  <TableCell>{row.movie_title}</TableCell>
                  <TableCell>{row.room}</TableCell>
                  <TableCell align="right">{row.price}</TableCell>
                  <TableCell align="right">{row.available_seats}</TableCell>
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
        <DialogTitle>{form.id ? "Editar show" : "Nuevo show"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Título"
              value={form.movie_title}
              onChange={(e) => handleFormChange("movie_title", e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Sala"
              value={form.room}
              onChange={(e) => handleFormChange("room", e.target.value)}
              fullWidth
              required
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Precio"
                type="number"
                inputProps={{ step: "0.01", min: 0 }}
                value={form.price}
                onChange={(e) => handleFormChange("price", e.target.value === "" ? "" : Number(e.target.value))}
                fullWidth
                required
              />
              <TextField
                label="Asientos disponibles"
                type="number"
                inputProps={{ step: "1", min: 0 }}
                value={form.available_seats}
                onChange={(e) => handleFormChange("available_seats", e.target.value === "" ? "" : Number(e.target.value))}
                fullWidth
                required
              />
            </Stack>
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
        <DialogTitle>Eliminar show</DialogTitle>
        <DialogContent>
          <Typography>¿Seguro que deseas eliminar el show <b>{toDelete?.movie_title}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}