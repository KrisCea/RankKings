import { Mic, Podcast } from "lucide-react";
import type { CategoryDefinition } from "../types";

export const podcasts: CategoryDefinition = {
  id: "podcasts",
  label: "Podcasts",
  itemLabel: "episodio",
  childrenLabel: "Episodios",
  active: false,
  vote: { icon: Mic, label: "Dar voto" },
  list: { icon: Podcast, verb: "Escuchar luego" },
  identifiers: [
    {
      key: "isrc",
      label: "ISRC",
      description: "Código internacional de grabación del episodio",
      requirement: "recommended",
      grantsCertification: true,
    },
  ],
};