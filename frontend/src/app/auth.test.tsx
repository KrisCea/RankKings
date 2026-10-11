import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { logInAs, renderApp } from "../test/renderApp";

const PASSPHRASE = "mi gato come pescado azul";

async function fillRegister(
  user: UserEvent,
  values: { username?: string; email?: string; password?: string; confirm?: string } = {}
) {
  const {
    username = "nuevo_usuario",
    email = "nuevo@test.dev",
    password = PASSPHRASE,
    confirm = password,
  } = values;

  await user.type(screen.getByLabelText("Nombre"), "Usuario Nuevo");
  await user.type(screen.getByLabelText("Nombre de usuario"), username);
  await user.type(screen.getByLabelText("Correo"), email);
  await user.type(screen.getByLabelText("Contraseña"), password);
  await user.type(screen.getByLabelText("Repite la contraseña"), confirm);
}

async function logIn(user: UserEvent, email: string, password: string) {
  await user.type(screen.getByLabelText("Correo"), email);
  await user.type(screen.getByLabelText("Contraseña"), password);
  await user.click(screen.getByRole("button", { name: "Entrar" }));
}

describe("inicio de sesión", () => {
  it("valida el formulario, rechaza credenciales incorrectas, entra y vuelve a salir", async () => {
    const user = userEvent.setup({ delay: null });
    await renderApp("/login");

    // Campos vacíos
    await user.click(await screen.findByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Ingresa un correo válido")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu contraseña")).toBeInTheDocument();

    // Contraseña incorrecta
    await user.type(screen.getByLabelText("Correo"), "crisc@rankkings.dev");
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos");

    // Contraseña correcta: entra y vuelve al inicio
    const password = screen.getByLabelText("Contraseña");
    await user.clear(password);
    await user.type(password, "12345678");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    const avatar = await screen.findByRole("button", { name: "Cristóbal" });
    await user.click(avatar);
    expect(screen.getByRole("link", { name: "Ver perfil" })).toHaveAttribute(
      "href",
      "/profile/crisc"
    );
    expect(screen.getByRole("link", { name: "Mi lista" })).toHaveAttribute("href", "/library");

    // Cerrar sesión devuelve al estado de visitante
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(await screen.findByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("lleva a quien ya tiene sesión lejos de las pantallas de acceso", async () => {
    logInAs("1");
    const { router } = await renderApp("/login");

    expect(await screen.findByRole("button", { name: "Cristóbal" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/");

    await act(async () => {
      await router.navigate("/register");
    });
    await waitFor(() => expect(router.state.location.pathname).toBe("/"));
  });
});

describe("registro y verificación del correo", () => {
  it("valida la contraseña, la confirmación y el captcha", async () => {
    const user = userEvent.setup({ delay: null });
    await renderApp("/register");

    // Una contraseña predecible no pasa y el medidor la marca débil
    await fillRegister(user, { password: "abcdefghijkl" });
    expect(screen.getByText("Seguridad: Débil")).toBeInTheDocument();
    const submit = screen.getByRole("button", { name: "Crear cuenta" });
    await user.click(submit);
    expect(await screen.findByText(/demasiado predecible/)).toBeInTheDocument();
    expect(screen.getByText("Confirma que no eres un robot")).toBeInTheDocument();

    // Con una frase larga el medidor sube; si la confirmación no coincide, se avisa
    const password = screen.getByLabelText("Contraseña");
    await user.clear(password);
    await user.type(password, PASSPHRASE);
    expect(screen.getByText("Seguridad: Buena")).toBeInTheDocument();

    const confirm = screen.getByLabelText("Repite la contraseña");
    await user.clear(confirm);
    await user.type(confirm, "otra frase distinta por completo");
    await user.click(submit);
    expect(await screen.findByText("Las contraseñas no coinciden")).toBeInTheDocument();
  });

  it("muestra el error del servidor y pide resolver el captcha otra vez", async () => {
    const user = userEvent.setup({ delay: null });
    await renderApp("/register");

    await fillRegister(user, { username: "crisc" }); // ese usuario ya existe
    await user.click(screen.getByLabelText(/No soy un robot/));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Ese nombre de usuario ya está en uso"
    );
    expect(screen.getByLabelText(/No soy un robot/)).not.toBeChecked();
  });

  it("registra una cuenta, exige verificar el correo y permite entrar después", async () => {
    const user = userEvent.setup({ delay: null });
    await renderApp("/register");

    await fillRegister(user);
    await user.click(screen.getByLabelText(/No soy un robot/));
    await user.click(screen.getByRole("button", { name: "Crear cuenta" }));

    // Registrarse no inicia sesión: pide revisar el correo
    expect(await screen.findByRole("heading", { name: "Revisa tu correo" })).toBeInTheDocument();
    expect(screen.getByText("nuevo@test.dev")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir el enlace de verificación" })).toBeInTheDocument();

    // Sin verificar el correo no se puede entrar
    await user.click(screen.getByRole("link", { name: "Volver a iniciar sesión" }));
    await logIn(user, "nuevo@test.dev", PASSPHRASE);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Debes verificar tu correo antes de entrar"
    );

    // Pide un enlace nuevo y queda en espera para el siguiente reenvío
    await user.click(screen.getByRole("link", { name: "Reenviar correo de verificación" }));
    expect(await screen.findByRole("heading", { name: "Revisa tu correo" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reenviar correo de verificación" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Si hay una cuenta pendiente con ese correo"
    );
    expect(screen.getByRole("button", { name: /Reenviar en \d+ s/ })).toBeDisabled();

    // Abre el enlace y la cuenta queda verificada
    await user.click(await screen.findByRole("link", { name: "Abrir el enlace de verificación" }));
    expect(await screen.findByRole("heading", { name: "Correo verificado" })).toBeInTheDocument();

    // Ya puede iniciar sesión
    await user.click(
      within(screen.getByRole("main")).getByRole("link", { name: "Iniciar sesión" })
    );
    await logIn(user, "nuevo@test.dev", PASSPHRASE);
    expect(await screen.findByRole("button", { name: "Usuario Nuevo" })).toBeInTheDocument();
  });

  it("explica un enlace inválido y permite pedir otro escribiendo el correo", async () => {
    const user = userEvent.setup({ delay: null });
    await renderApp("/verify-email?token=falso");

    expect(
      await screen.findByRole("heading", { name: "No pudimos verificar tu correo" })
    ).toBeInTheDocument();
    expect(screen.getByText("El enlace no es válido o ya fue usado")).toBeInTheDocument();

    const resend = screen.getByRole("button", { name: "Reenviar correo de verificación" });
    expect(resend).toBeDisabled(); // sin correo no se puede pedir
    await user.type(screen.getByLabelText("Correo de tu cuenta"), "alguien@test.dev");
    expect(resend).toBeEnabled();
    await user.click(resend);
    expect(await screen.findByRole("status")).toBeInTheDocument();
  });

  it("sin enlace ni correo conocido, la pantalla de verificación pide el correo", async () => {
    await renderApp("/verify-email");

    expect(await screen.findByRole("heading", { name: "Revisa tu correo" })).toBeInTheDocument();
    expect(screen.getByText(/Usa el enlace de verificación/)).toBeInTheDocument();
    expect(screen.getByLabelText("Correo de tu cuenta")).toBeInTheDocument();
  });
});