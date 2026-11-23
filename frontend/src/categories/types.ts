import type { LucideIcon } from "lucide-react";
import type { IdentifierDefinition } from "../types/identifier";

// Para sumar una categoría: 1) agregar su id aquí, 2) crear su archivo en definitions/,
// 3) registrarla en registry.ts (el compilador avisa si falta) y 4) agregar su bloque de
// color en styles/themes.css (el color tiene que seguir en CSS porque Tailwind lo necesita ahí).
export type CategoryId =
  | "music"
  | "podcasts"
  | "books"
  | "movies"
  | "concerts"
  | "videogames"
  | "art"
  | "boardgames";

export interface CategoryDefinition {
  id: CategoryId;
  label: string; // nombre visible: "Música"
  itemLabel: string; // cómo se llama un ítem de la categoría: "disco"
  childrenLabel: string; // cómo se llama el contenido de una colección: "Canciones"
  active: boolean; // true cuando ya tiene el flujo completo de subida y validación
  vote: { icon: LucideIcon; label: string }; // botón de voto
  list: { icon: LucideIcon; verb: string }; // botón de "agregar a mi lista"
  identifiers: IdentifierDefinition[]; // requisitos para publicar
}