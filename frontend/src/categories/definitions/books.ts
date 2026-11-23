import { BookMarked, BookOpen } from "lucide-react";
import type { CategoryDefinition } from "../types";

export const books: CategoryDefinition = {
  id: "books",
  label: "Libros",
  itemLabel: "libro",
  childrenLabel: "Capítulos",
  active: true,
  vote: { icon: BookMarked, label: "Dar voto" },
  list: { icon: BookOpen, verb: "Leer luego" },
  identifiers: [
    {
      key: "isbn",
      label: "ISBN",
      description: "Código internacional de libro",
      requirement: "required",
      pattern: /^(97[89])?\d{9}(\d|X)$/,
      grantsCertification: true,
    },
  ],
};