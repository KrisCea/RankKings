import { screen, waitFor, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { logInAs, renderApp } from "../test/renderApp";

// Abre los comentarios del post que ocupa esa posición en el feed
async function openComments(user: UserEvent, index = 0) {
  const articles = await screen.findAllByRole("article");
  await user.click(within(articles[index]).getByRole("button", { name: "Comentarios" }));
  return screen.findByRole("dialog", { name: "Comentarios" });
}

describe("comentarios", () => {
  it("un visitante lee los comentarios y sus respuestas, pero no puede escribir ni dar like", async () => {
    const user = userEvent.setup();
    await renderApp("/");
    await screen.findByRole("link", { name: "Iniciar sesión" }); // la sesión ya se resolvió

    const dialog = within(await openComments(user));
    expect(
      await dialog.findByText("La cinematografía es impresionante, Nolan nunca falla.")
    ).toBeInTheDocument();
    expect(
      dialog.getByText("Totalmente de acuerdo, la banda sonora también es increíble.")
    ).toBeInTheDocument();

    // No puede escribir: en vez del campo hay una invitación a iniciar sesión
    expect(dialog.queryByPlaceholderText("Escribe un comentario...")).not.toBeInTheDocument();
    expect(dialog.getByRole("link", { name: "Inicia sesión" })).toHaveAttribute("href", "/login");

    // Las respuestas están plegadas hasta que se piden
    expect(dialog.queryByText(/prueba Trinity/)).not.toBeInTheDocument();
    await user.click(dialog.getByRole("button", { name: "Ver 1 respuesta" }));
    expect(dialog.getByText(/prueba Trinity/)).toBeInTheDocument();
    await user.click(dialog.getByRole("button", { name: "Ocultar respuestas" }));
    expect(dialog.queryByText(/prueba Trinity/)).not.toBeInTheDocument();

    // Dar like lleva a iniciar sesión
    await user.click(dialog.getByRole("button", { name: "12" }));
    expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("un usuario comenta, responde en un hilo y da like, y el contador del post se actualiza", async () => {
    logInAs("1");
    const user = userEvent.setup({ delay: null });
    await renderApp("/");
    const articles = await screen.findAllByRole("article");
    await screen.findByRole("button", { name: "Cristóbal" });

    const dialog = within(await openComments(user));
    await dialog.findByText("La cinematografía es impresionante, Nolan nunca falla.");

    // Comentar
    const input = dialog.getByPlaceholderText("Escribe un comentario...");
    await user.type(input, "Gran reseña");
    await user.click(dialog.getByRole("button", { name: "Enviar comentario" }));
    expect(await dialog.findByText("Gran reseña")).toBeInTheDocument();
    expect(input).toHaveValue("");
    await waitFor(() =>
      expect(within(articles[0]).getByRole("button", { name: "Comentarios" })).toHaveTextContent(
        "35"
      )
    );

    // Responder: se puede cancelar y, al enviar, la respuesta queda en el hilo
    await user.click(dialog.getAllByRole("button", { name: "Responder" })[0]);
    expect(dialog.getByText(/Respondiendo a/)).toBeInTheDocument();
    await user.click(dialog.getByRole("button", { name: "Cancelar respuesta" }));
    expect(dialog.queryByText(/Respondiendo a/)).not.toBeInTheDocument();

    await user.click(dialog.getAllByRole("button", { name: "Responder" })[0]);
    await user.type(dialog.getByPlaceholderText("Responder a @pedro_libros..."), "Gracias");
    await user.click(dialog.getByRole("button", { name: "Enviar comentario" }));
    expect(await dialog.findByText("Gracias")).toBeInTheDocument();
    expect(dialog.getByText(/prueba Trinity/)).toBeInTheDocument(); // el hilo se abrió
    await waitFor(() => expect(dialog.queryByText(/Respondiendo a/)).not.toBeInTheDocument());

    // Like y quitar el like
    await user.click(dialog.getByRole("button", { name: "12" }));
    expect(await dialog.findByRole("button", { name: "13" })).toBeInTheDocument();
    await user.click(dialog.getByRole("button", { name: "13" }));
    expect(await dialog.findByRole("button", { name: "12" })).toBeInTheDocument();

    // Escape cierra la ventana
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("compartir", () => {
  it("un visitante que intenta compartir es llevado a iniciar sesión", async () => {
    const user = userEvent.setup();
    await renderApp("/");
    await screen.findByRole("link", { name: "Iniciar sesión" });

    const articles = await screen.findAllByRole("article");
    await user.click(within(articles[0]).getByRole("button", { name: "Compartir" }));
    expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("permite buscar personas, enviarles el post y copiar el enlace", async () => {
    logInAs("1");
    const user = userEvent.setup({ delay: null });
    await renderApp("/");
    const articles = await screen.findAllByRole("article");
    await screen.findByRole("button", { name: "Cristóbal" });

    await user.click(within(articles[0]).getByRole("button", { name: "Compartir" }));
    const dialog = within(await screen.findByRole("dialog", { name: "Compartir" }));

    // La lista incluye a los demás, no a quien tiene la sesión
    expect(await dialog.findByText("Ana Torres")).toBeInTheDocument();
    expect(dialog.getByText("Sony Music")).toBeInTheDocument();
    expect(dialog.queryByText("Cristóbal")).not.toBeInTheDocument();

    // Buscar
    const search = dialog.getByPlaceholderText("Buscar personas...");
    await user.type(search, "zzz");
    expect(dialog.getByText("No se encontraron personas.")).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "pedro");
    expect(dialog.queryByText("Ana Torres")).not.toBeInTheDocument();
    expect(dialog.getByText("Pedro Ramírez")).toBeInTheDocument();

    // Enviar: el botón queda como enviado y el contador del post sube
    await user.click(dialog.getByRole("button", { name: "Enviar" }));
    expect(await dialog.findByRole("button", { name: "Enviado" })).toBeDisabled();
    await waitFor(() =>
      expect(within(articles[0]).getByRole("button", { name: "Compartir" })).toHaveTextContent(
        "13"
      )
    );

    // Copiar el enlace del post
    await user.click(dialog.getByRole("button", { name: "Copiar enlace" }));
    expect(await dialog.findByRole("button", { name: "Enlace copiado" })).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe(`${window.location.origin}/post/p1`);
  });
});