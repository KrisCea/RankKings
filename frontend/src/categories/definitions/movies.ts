import { Clapperboard, Popcorn } from "lucide-react";
import type { CategoryDefinition } from "../types";

export const movies: CategoryDefinition = {
  id: "movies",
  label: "Películas",
  itemLabel: "película",
  childrenLabel: "Capítulos",
  active: true,
  vote: { icon: Clapperboard, label: "Dar voto" },
  list: { icon: Popcorn, verb: "Ver luego" },
  identifiers: [
    {
      key: "isan",
      label: "ISAN",
      description: "Código internacional audiovisual",
      requirement: "recommended",
      grantsCertification: true,
    },
    {
      key: "imdbId",
      label: "IMDb ID",
      description: "Identificador en IMDb",
      requirement: "required",
      pattern: /^tt\d{7,8}$/,
      grantsCertification: true,
    },
  ],
};