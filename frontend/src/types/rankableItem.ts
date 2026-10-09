import type { CategoryId } from "../constants/categories";
import type { Creator } from "./creator";
import type { ExternalLink } from "./externalLink";

export type VerificationStatus = "verified" | "partial" | "unverified";

export interface RankableItem {
  id: string;
  category: CategoryId;
  title: string;
  description?: string;
  creator: Creator;
  uploadedBy: string;
  year?: number;
  coverUrl: string;
  identifiers: Record<string, string>;
  verificationStatus: VerificationStatus;

  // Post de tipo "item" que publica este ítem (de ahí salen sus votos y comentarios)
  postId: string;

  // Puntuación directa del ítem (lo calcula el backend)
  averageRating: number;
  ratingsCount: number;

  // Colecciones (álbum, serie, podcast...): cada hijo es un RankableItem completo
  parentId?: string;
  position?: number; // orden dentro de su colección
  childrenCount: number;
  childrenAverageRating?: number; // calculado por el backend a partir de los hijos

  // Lista personal: lo calcula el backend según la sesión de quien consulta
  savedByCurrentUser: boolean;
  savesCount: number; // cuántas personas lo tienen en su lista (señal para estadísticas)

  externalLinks: ExternalLink[];
  createdAt: string;
}