// Mientras el backend no esté listo para validar unicidad de identificadores,
// no bloqueamos la publicación aunque falten campos "required".
// Cambiar a `true` cuando el backend esté conectado y haga la verificación real.
export const ENFORCE_REQUIRED_IDENTIFIERS = false;