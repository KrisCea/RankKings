import { Frame, Palette } from "lucide-react";
import type { CategoryDefinition } from "../types";

export const art: CategoryDefinition = {
  id: "art",
  label: "Arte",
  itemLabel: "obra",
  childrenLabel: "Obras",
  active: true,
  vote: { icon: Palette, label: "Dar voto" },
  list: { icon: Frame, verb: "Visitar luego" },
  identifiers: [
    {
      key: "iso12944",
      label: "ISO 12944",
      description: "Norma de referencia para la obra",
      requirement: "recommended",
      grantsCertification: false,
    },
  ],
};