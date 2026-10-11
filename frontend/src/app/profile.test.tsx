import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { logInAs, renderApp } from "../test/renderApp";

// La cabecera del perfil es la única <section> de la página
async function findHeader(name: string) {
  const heading = await screen.findByRole("heading", { name, level: 1 });
  return within(heading.closest("section")!);
}

describe("perfil de usuario", () => {
  it("muestra el perfil ajeno con sus publicaciones y reseñas, y pide sesión para seguirlo", async () => {
    const user = userEvent.setup();
    await renderApp("/profile/ana_reviews");

    const header = await findHeader("Ana Torres");
    expect(header.getByText("@ana_reviews")).toBeInTheDocument();
    expect(header.getByText("Cinéfila empedernida. Crítica amateur.")).toBeInTheDocument();
    expect(header.getByText("seguidores").parentElement).toHaveTextContent(/1\D?240/);

    // Publicaciones (pestaña inicial): su ítem
    expect(await screen.findAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Oppenheimer" })).toBeInTheDocument();

    // Reseñas
    await user.click(screen.getByRole("tab", { name: "Reseñas" }));
    expect(await screen.findByText(/Un disco que envejece mejor/)).toBeInTheDocument();
    expect(screen.getByText("Reseña")).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(1);

    // Sin sesión, seguir lleva al inicio de sesión
    await screen.findByRole("link", { name: "Iniciar sesión" });
    await user.click(header.getByRole("button", { name: "Seguir" }));
    expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("seguir y dejar de seguir actualiza el botón y el contador", async () => {
    logInAs("1");
    const user = userEvent.setup();
    await renderApp("/profile/ana_reviews");

    const header = await findHeader("Ana Torres");
    await screen.findByRole("button", { name: "Cristóbal" });

    const follow = header.getByRole("button", { name: "Seguir" });
    expect(follow).toHaveAttribute("aria-pressed", "false");
    await user.click(follow);
    await waitFor(() =>
      expect(header.getByRole("button", { name: "Siguiendo" })).toHaveAttribute(
        "aria-pressed",
        "true"
      )
    );
    expect(header.getByText("seguidores").parentElement).toHaveTextContent(/1\D?241/);

    await user.click(header.getByRole("button", { name: "Siguiendo" }));
    await waitFor(() => expect(header.getByRole("button", { name: "Seguir" })).toBeInTheDocument());
    expect(header.getByText("seguidores").parentElement).toHaveTextContent(/1\D?240/);
  });

  it("en el propio perfil se ofrece la lista personal y no el botón de seguir", async () => {
    logInAs("1");
    const user = userEvent.setup();
    await renderApp("/profile/crisc");

    const header = await findHeader("Cristóbal");
    expect(await header.findByRole("link", { name: "Mi lista" })).toHaveAttribute(
      "href",
      "/library"
    );
    expect(header.queryByRole("button", { name: "Seguir" })).not.toBeInTheDocument();

    // Publicó un ítem y todavía no escribió reseñas
    expect(await screen.findAllByRole("article")).toHaveLength(1);
    await user.click(screen.getByRole("tab", { name: "Reseñas" }));
    expect(await screen.findByText("Todavía no escribiste reseñas.")).toBeInTheDocument();
  });

  it("a un visitante el perfil ajeno le muestra el mensaje de reseñas vacías", async () => {
    const user = userEvent.setup();
    await renderApp("/profile/crisc");

    await findHeader("Cristóbal");
    await user.click(screen.getByRole("tab", { name: "Reseñas" }));
    expect(await screen.findByText("Todavía no hay reseñas.")).toBeInTheDocument();
  });

  it("una cuenta de empresa verificada muestra su insignia", async () => {
    await renderApp("/profile/sonymusic");

    const header = await findHeader("Sony Music");
    expect(header.getByText(/Cuenta de empresa/)).toBeInTheDocument();
    expect(header.getByLabelText("Cuenta verificada")).toBeInTheDocument();
  });

  it("avisa cuando el usuario no existe y permite volver al inicio", async () => {
    const user = userEvent.setup();
    const { router } = await renderApp("/profile/nadie");

    expect(await screen.findByText("No encontramos a este usuario.")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Volver al inicio" }));
    expect(router.state.location.pathname).toBe("/");
    expect(await screen.findAllByRole("article")).toHaveLength(6);
  });
});

describe("vista previa de perfil", () => {
  it("aparece al pasar el mouse sobre el autor, permite seguirlo y se cierra al salir", async () => {
    logInAs("1");
    const user = userEvent.setup();
    await renderApp("/");
    const articles = await screen.findAllByRole("article");
    await screen.findByRole("button", { name: "Cristóbal" });

    const author = within(articles[0]).getByText("@ana_reviews");
    await user.hover(author);
    expect(await screen.findByText("Cinéfila empedernida. Crítica amateur.")).toBeInTheDocument();

    // Se puede seguir desde la propia vista previa
    await user.click(screen.getByRole("button", { name: "Seguir" }));
    expect(await screen.findByRole("button", { name: "Siguiendo" })).toBeInTheDocument();

    await user.unhover(author);
    await waitFor(() =>
      expect(screen.queryByText("Cinéfila empedernida. Crítica amateur.")).not.toBeInTheDocument()
    );
  });

  it("en la vista previa del propio usuario se ofrece ver el perfil, no seguirse", async () => {
    logInAs("1");
    const user = userEvent.setup();
    await renderApp("/");
    const articles = await screen.findAllByRole("article");
    await screen.findByRole("button", { name: "Cristóbal" });

    // El cuarto post lo publicó crisc
    await user.hover(within(articles[3]).getByText("@crisc"));
    expect(await screen.findByRole("link", { name: "Ver mi perfil" })).toHaveAttribute(
      "href",
      "/profile/crisc"
    );
    expect(screen.queryByRole("button", { name: "Seguir" })).not.toBeInTheDocument();
  });
});