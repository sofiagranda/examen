import { http } from "./http";
// import type { PaginatedResponse } from "../types/Pagination";

export interface Shows {
  id: number;
  movie_title: string;
  room: string;
  price: number;
  available_seats: number;
}


export const getShows = async (page = 1) => {
  const res = await http.get(`http://127.0.0.1:8000/api/shows/`, {
    params: { page }, // DRF: ?page=N
  });
  return res.data; // 
};


/**
 * Guardar o Editar Show
 * Django espera 'nombre' y 'descripcion'
 */
export const saveShows = async (id: number | null, data: { movie_title: string; room: string; price: number; available_seats:number }): Promise<Shows> => {
  if (id) {
    const res = await http.patch(`shows/${id}/`, data);
    return res.data;
  } else {
    const res = await http.post("shows/", data);
    return res.data;
  }
};

// Eliminar Show
export const deleteShows = async (id: number): Promise<void> => {
  await http.delete(`shows/${id}/`);
};