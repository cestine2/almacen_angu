// import { UserEntity } from "../entities/UserEntity";

export type AuthResponse = {
    access_token: string;
    token_type: string; // Generalmente 'bearer'
    expires_in: number; // Tiempo de expiración en segundos
  }