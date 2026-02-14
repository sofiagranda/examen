import { http } from "./http";

export type LoginResponse = {
  token: string;
  user_id: number;
  username: string;
  is_staff: boolean;
  email: string;
};

export async function loginApi(username: string, password: string) {
  const { data } = await http.post("api/auth/login/", { username, password });
  if (!data?.token) throw new Error("Login sin token.");
  return data as LoginResponse;
}
