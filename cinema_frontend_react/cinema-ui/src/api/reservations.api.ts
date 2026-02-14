import { http } from "./http";
// import type { PaginatedResponse } from "../types/Pagination";

export interface Reservations {
  id: number;
  customer_name: string;
  seats: number;
  status: string;
  created_at: number;
}

export const getReservations = async () => {
  const res = await http.get("http://127.0.0.1:8000/api/reservations/");
  console.log(res.data.results)
  return res.data.results || res.data;
};

/**
 * Guardar o Editar Reservations
 * Django espera 'nombre' y 'descripcion'
 */
export const saveReservations = async (id: number | null, data: { customer_name: string; seats: number; status: string; created_at: number; }): Promise<Reservations> => {
  if (id) {
    const res = await http.patch(`http://127.0.0.1:8000/api/reservations/${id}/`, data);
    return res.data;
  } else {
    const res = await http.post("http://127.0.0.1:8000/api/reservations/", data);
    return res.data;
  }
};

// Eliminar Reservations
export const deleteReservations = async (id: number): Promise<void> => {
  await http.delete(`http://127.0.0.1:8000/api/reservations/${id}/`);
};