export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  displayName: string;
  username: string;
  email: string;
  password: string;
  captchaToken: string;
}

export interface RegisterResult {
  email: string;
  // MOCK: el backend NUNCA devuelve el enlace de verificación; solo llega por correo.
  devVerificationUrl?: string;
}

export interface ResendVerificationResult {
  // MOCK: igual que arriba
  devVerificationUrl?: string;
}