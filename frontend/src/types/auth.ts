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
}