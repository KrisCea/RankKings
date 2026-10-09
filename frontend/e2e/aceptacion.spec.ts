import { expect, test, type Page } from "@playwright/test";

// Cuenta de prueba del modo demo (VITE_USE_MOCKS=true)
const DEMO_EMAIL = "crisc@rankkings.dev";
const DEMO_PASSWORD = "12345678";

test.beforeEach(async ({ page }) => {
  // Las imágenes de ejemplo vienen de internet: se bloquean para que las pruebas sean rápidas y
  // no dependan de la red (los textos alternativos y la estructura de la página no cambian)
  await page.route(
    /^https:\/\/(ui-avatars\.com|image\.tmdb\.org|upload\.wikimedia\.org)\//,
    (route) => route.abort()
  );
});

// Se usa estando ya en /login
async function logIn(page: Page, email: string, password: string) {
  await page.getByLabel("Correo", { exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

test("un visitante que intenta votar es enviado a iniciar sesión y, al entrar, puede votar", async ({
  page,
}) => {
  await page.goto("/");

  const vote = page.getByRole("button", { name: "Dar voto" }).first();
  await expect(vote).toHaveAttribute("aria-pressed", "false");

  // Sin sesión, interactuar lleva al inicio de sesión con un aviso
  await vote.click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("status")).toContainText("Inicia sesión o crea una cuenta");

  // Al iniciar sesión vuelve al inicio y la acción ya está permitida
  await logIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  await expect(page).toHaveURL(/\/$/);

  const voteAfterLogin = page.getByRole("button", { name: "Dar voto" }).first();
  await expect(voteAfterLogin).toHaveText("128");
  await voteAfterLogin.click();
  await expect(voteAfterLogin).toHaveAttribute("aria-pressed", "true");
  await expect(voteAfterLogin).toHaveText("129");
});

test("una persona se registra, verifica su correo y entra a su cuenta", async ({ page }) => {
  const passphrase = "mi gato come pescado azul";

  // Una contraseña predecible no pasa
  await page.goto("/register");
  await page.getByLabel("Nombre", { exact: true }).fill("Usuario Nuevo");
  await page.getByLabel("Nombre de usuario").fill("nuevo_usuario");
  await page.getByLabel("Correo").fill("nuevo@test.dev");
  await page.getByLabel("Contraseña", { exact: true }).fill("abcdefghijkl");
  await page.getByLabel("Repite la contraseña").fill("abcdefghijkl");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByText(/demasiado predecible/)).toBeVisible();

  // Con una frase larga y el captcha resuelto, la cuenta se crea y pide verificar el correo
  await page.getByLabel("Contraseña", { exact: true }).fill(passphrase);
  await page.getByLabel("Repite la contraseña").fill(passphrase);
  await page.getByLabel(/No soy un robot/).check();
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByRole("heading", { name: "Revisa tu correo" })).toBeVisible();

  // Sin verificar el correo no se puede entrar
  await page.getByRole("link", { name: "Volver a iniciar sesión" }).click();
  await logIn(page, "nuevo@test.dev", passphrase);
  await expect(page.getByRole("alert")).toContainText("Debes verificar tu correo antes de entrar");

  // Pide un enlace nuevo y lo abre (en modo demo aparece en pantalla en vez de llegar por correo)
  await page.getByRole("link", { name: "Reenviar correo de verificación" }).click();
  await page.getByRole("button", { name: "Reenviar correo de verificación" }).click();
  await expect(page.getByRole("status")).toContainText("Si hay una cuenta pendiente");
  await page.getByRole("link", { name: "Abrir el enlace de verificación" }).click();
  await expect(page.getByRole("heading", { name: "Correo verificado" })).toBeVisible();

  // Con el correo verificado ya puede iniciar sesión
  await page.getByRole("main").getByRole("link", { name: "Iniciar sesión" }).click();
  await logIn(page, "nuevo@test.dev", passphrase);
  await expect(page.getByRole("button", { name: "Usuario Nuevo" })).toBeVisible();
});

test("un usuario agrega un ítem a su lista, lo encuentra en la biblioteca filtrando por categoría y lo quita", async ({
  page,
}) => {
  await page.goto("/login");
  await logIn(page, DEMO_EMAIL, DEMO_PASSWORD);
  await expect(page).toHaveURL(/\/$/);

  // Espera a que el inicio refleje la lista de esta cuenta (ya tiene 3 de los 4 ítems del feed)
  await expect(page.getByRole("button", { name: "En mi lista" })).toHaveCount(3);

  // Agrega "La noche estrellada", el único que falta
  await page.getByRole("button", { name: "Agregar a mi lista" }).click();
  await expect(page.getByRole("button", { name: "En mi lista" })).toHaveCount(4);

  // Va a la biblioteca desde el menú del avatar. Se navega sin recargar: los mocks viven en memoria
  await page.getByRole("button", { name: "Cristóbal" }).click();
  await page.getByRole("link", { name: "Mi lista" }).click();
  await expect(page.getByRole("heading", { name: "Mi lista" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Todo 5" })).toBeVisible();

  // Filtra por categoría: solo queda lo de arte
  await page.getByRole("button", { name: "Arte 1" }).click();
  await expect(page).toHaveURL(/categoria=art/);
  await expect(page.getByText("La noche estrellada")).toBeVisible();
  await expect(page.getByText("Oppenheimer")).toHaveCount(0);

  // Al quitarlo desaparece, y como era el único de arte, el filtro vuelve a mostrar todo
  await page
    .getByRole("listitem")
    .filter({ hasText: "La noche estrellada" })
    .getByRole("button", { name: "En mi lista" })
    .click();
  await expect(page.getByText("La noche estrellada")).toHaveCount(0);
  await expect(page.getByText("Oppenheimer")).toBeVisible();
});