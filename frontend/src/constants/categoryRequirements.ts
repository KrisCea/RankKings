import type { CategoryId } from "./categories";
import type { IdentifierDefinition } from "../types/identifier";

export const CATEGORY_REQUIREMENTS: Record<CategoryId, IdentifierDefinition[]> = {
  music: [
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

  podcasts: [
    {
      key: "isrc",
      label: "ISRC",
      description: "Código internacional de grabación del episodio",
      requirement: "recommended",
      grantsCertification: true,
    },
  ],

  books: [
    {
      key: "isbn",
      label: "ISBN",
      description: "Código internacional de libro",
      requirement: "required",
      pattern: /^(97[89])?\d{9}(\d|X)$/,
      grantsCertification: true,
    },
  ],

  movies: [
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

  videogames: [
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

  art: [
    {
      key: "iso12944",
      label: "ISO 12944",
      description: "Norma de referencia para la obra",
      requirement: "recommended",
      grantsCertification: false,
    },
  ],

  concerts: [
  {
    key: "quasiId",
    label: "Identificador compuesto",
    description: "Combinación de artista + recinto + fecha, para evitar duplicados",
    requirement: "recommended",
    grantsCertification: false,
  },
],

boardgames: [
  {
    key: "quasiId",
    label: "Identificador compuesto",
    description: "Combinación de editorial + título + año, para evitar duplicados",
    requirement: "recommended",
    grantsCertification: false,
  },
],
};