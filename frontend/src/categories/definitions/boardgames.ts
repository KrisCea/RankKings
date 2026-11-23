import { Dices, Puzzle } from "lucide-react";
import type { CategoryDefinition } from "../types";

export const boardgames: CategoryDefinition = {
  id: "boardgames",
  label: "Juegos de mesa",
  itemLabel: "juego",
  childrenLabel: "Expansiones",
  active: false,
  vote: { icon: Dices, label: "Dar voto" },
  list: { icon: Puzzle, verb: "Jugar luego" },
  identifiers: [
    {
      key: "quasiId",
      label: "Identificador compuesto",
      description: "Combinación de editorial + título + año, para evitar duplicados",
      requirement: "recommended",
      grantsCertification: false,
    },
  ],
};