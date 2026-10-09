import { Star, Ticket } from "lucide-react";
import type { CategoryDefinition } from "../types";

export const concerts: CategoryDefinition = {
  id: "concerts",
  label: "Conciertos",
  itemLabel: "concierto",
  childrenLabel: "Canciones",
  active: false,
  vote: { icon: Star, label: "Dar voto" },
  list: { icon: Ticket, verb: "Ir luego" },
  identifiers: [
    {
      key: "quasiId",
      label: "Identificador compuesto",
      description: "Combinación de artista + recinto + fecha, para evitar duplicados",
      requirement: "recommended",
      grantsCertification: false,
    },
  ],
};