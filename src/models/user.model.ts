export interface User {
  id: number;
  nombre: string;
  correo: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
}