import { Gamepad2, Joystick } from "lucide-react";
import type { CategoryDefinition } from "../types";

export const videogames: CategoryDefinition = {
  id: "videogames",
  label: "Videojuegos",
  itemLabel: "videojuego",
  childrenLabel: "Contenido",
  active: false,
  vote: { icon: Gamepad2, label: "Dar voto" },
  list: { icon: Joystick, verb: "Jugar luego" },
  identifiers: [
    {
      key: "pegi",
      label: "PEGI",
      description: "Clasificación europea por edad",
      requirement: "recommended",
      grantsCertification: false,
    },
    {
      key: "esrb",
      label: "ESRB",
      description: "Clasificación norteamericana por edad",
      requirement: "recommended",
      grantsCertification: false,
    },
    {
      key: "iarc",
      label: "IARC",
      description: "Clasificación internacional por edad",
      requirement: "recommended",
      grantsCertification: false,
    },
  ],
};