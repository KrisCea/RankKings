import { Headphones, Music2 } from "lucide-react";
import type { CategoryDefinition } from "../types";

export const music: CategoryDefinition = {
  id: "music",
  label: "Música",
  itemLabel: "disco",
  childrenLabel: "Canciones",
  active: true,
  vote: { icon: Music2, label: "Dar voto" },
  list: { icon: Headphones, verb: "Escuchar luego" },
  identifiers: [
    {
      key: "isrc",
      label: "ISRC",
      description: "Código internacional de grabación",
      requirement: "recommended",
      pattern: /^[A-Z]{2}-?\w{3}-?\d{2}-?\d{5}$/,
      grantsCertification: true,
    },
    {
      key: "ismn",
      label: "ISMN",
      description: "Código internacional de partitura musical",
      requirement: "recommended",
      grantsCertification: true,
    },
    {
      key: "genre",
      label: "Género",
      description: "Género musical",
      requirement: "required",
      grantsCertification: false,
    },
    {
      key: "key",
      label: "Clave musical",
      description: "Tonalidad de la pieza",
      requirement: "recommended",
      grantsCertification: false,
    },
  ],
};