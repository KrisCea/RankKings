export interface Creator {
  id: string;
  name: string;
  avatarUrl?: string;
  linkedUserId?: string;
  linkedUsername?: string; // si el creador tiene cuenta, permite mostrar su mini perfil
}