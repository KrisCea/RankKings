import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { logInAs, renderApp } from "../test/renderApp";

describe("página de un ítem", () => {
  it("muestra la ficha de un álbum con sus reseñas, canciones, enlaces y detalles", async () => {
    const user = userEvent.setup();
    await renderApp("/item/ri2");

    expect(
      await screen.findByRole("heading", { name: "Random Access Memories", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText("Música · 2013")).toBeInTheDocument();
    expect(screen.getByText("Promedio de canciones")).toBeInTheDocument();
    expect(screen.getByText("9.1")).toBeInTheDocument();

    // Reseñas (pestaña inicial)
    expect(await screen.findByText(/Un disco que envejece mejor/)).toBeInTheDocument();

    // Canciones: cada una enlaza con su propia ficha
    await user.click(screen.getByRole("tab", { name: /^Canciones/ }));
    const song = await screen.findByText("Get Lucky");
    expect(song.closest("a")).toHaveAttribute("href", "/item/ri7");
    expect(screen.getByText("Give Life Back to Music")).toBeInTheDocument();

    // Dónde encontrarlo: enlaces externos que se abren en otra pestaña
    await user.click(screen.getByRole("tab", { name: /^Dónde encontrarlo/ }));
    const spotify = screen.getByRole("link", { name: /Spotify/ });
    expect(spotify).toHaveAttribute("href", "https://open.spotify.com");
    expect(spotify).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /Discogs/ })).toBeInTheDocument();

    // Detalles: identificadores del ítem
    await user.click(screen.getByRole("tab", { name: "Detalles" }));
    expect(screen.getByText("ISRC")).toBeInTheDocument();
    expect(screen.getByText("FR-ZYX-13-00001")).toBeInTheDocument();
    expect(screen.getByText("Género")).toBeInTheDocument();
    expect(screen.getByText("Electrónica")).toBeInTheDocument();
  });

  it("una canción enlaza con el álbum al que pertenece", async () => {
    const user = userEvent.setup();
    await renderApp("/item/ri7");

    const parent = await screen.findByRole("link", { name: "Parte de Random Access Memories" });
    await user.click(parent);
    expect(
      await screen.findByRole("heading", { name: "Random Access Memories", level: 1 })
    ).toBeInTheDocument();
  });

  it("avisa cuando un ítem no tiene reseñas ni identificadores", async () => {
    const user = userEvent.setup();
    await renderApp("/item/ri4");

    expect(
      await screen.findByText("Todavía no hay reseñas de este ítem.")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Detalles" }));
    expect(
      screen.getByText("Todavía no hay identificadores registrados para este ítem.")
    ).toBeInTheDocument();
  });

  it("avisa cuando el ítem no existe", async () => {
    await renderApp("/item/no-existe");
    expect(await screen.findByText("No encontramos este ítem.")).toBeInTheDocument();
  });

  it("un visitante que intenta agregar a la lista es llevado a iniciar sesión", async () => {
    const user = userEvent.setup();
    await renderApp("/item/ri4");

    await screen.findByRole("link", { name: "Iniciar sesión" }); // la sesión ya se resolvió
    await user.click(await screen.findByRole("button", { name: "Agregar a mi lista" }));
    expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("un usuario vota, puntúa y agrega el ítem a su lista, y lo encuentra en la biblioteca", async () => {
    logInAs("1");
    const user = userEvent.setup();
    const { router } = await renderApp("/item/ri4");

    await screen.findByRole("button", { name: "Cristóbal" });

    // Lista personal: el contador sube al agregar
    expect(await screen.findByText("En 97 listas")).toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: "Agregar a mi lista" }));
    expect(await screen.findByRole("button", { name: "En mi lista" })).toBeInTheDocument();
    expect(await screen.findByText("En 98 listas")).toBeInTheDocument();

    // Votar
    const vote = await screen.findByRole("button", { name: "Dar voto" });
    expect(vote).toHaveTextContent("64");
    await user.click(vote);
    await waitFor(() => expect(vote).toHaveAttribute("aria-pressed", "true"));
    expect(vote).toHaveTextContent("65");

    // Puntuar: suma una puntuación a la ficha
    expect(screen.getByText("98 puntuaciones")).toBeInTheDocument();
    const slider = screen.getByLabelText("Puntuar");
    fireEvent.change(slider, { target: { value: "10" } });
    fireEvent.mouseUp(slider);
    expect(await screen.findByText("99 puntuaciones")).toBeInTheDocument();

    // Sin recargar (los datos de demostración viven en memoria), la biblioteca ya lo incluye
    await act(async () => {
      await router.navigate("/library");
    });
    const main = within(screen.getByRole("main"));
    expect(await main.findByRole("button", { name: "Todo 5" })).toBeInTheDocument();
    expect(main.getByRole("button", { name: "Arte 1" })).toBeInTheDocument();
  });
});

describe("página de una reseña", () => {
  it("muestra el ítem reseñado y la nota del autor, y enlaza con el ítem", async () => {
    const user = userEvent.setup();
    const { router } = await renderApp("/post/p5");

    expect(await screen.findByText("Reseña")).toBeInTheDocument();
    expect(screen.getByText("nota de @pedro_libros")).toBeInTheDocument();
    expect(screen.getByText(/Nolan consigue que tres horas/)).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /Oppenheimer/ }));
    expect(
      await screen.findByRole("heading", { name: "Oppenheimer", level: 1 })
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/item/ri1");
  });

  it("redirige las publicaciones de ítem a la ficha del ítem", async () => {
    const { router } = await renderApp("/post/p1");

    await waitFor(() => expect(router.state.location.pathname).toBe("/item/ri1"));
    expect(
      await screen.findByRole("heading", { name: "Oppenheimer", level: 1 })
    ).toBeInTheDocument();
  });

  it("avisa cuando la publicación no existe", async () => {
    await renderApp("/post/no-existe");
    expect(await screen.findByText("No encontramos esta publicación.")).toBeInTheDocument();
  });

  it("desde el inicio se llega a la ficha del ítem y a la reseña, y se puede volver", async () => {
    const user = userEvent.setup();
    const { router } = await renderApp("/");
    const articles = await screen.findAllByRole("article");

    // Publicación de ítem -> ficha del ítem
    await user.click(within(articles[0]).getByRole("heading", { name: "Oppenheimer" }));
    expect(
      await screen.findByRole("heading", { name: "Oppenheimer", level: 1 })
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/item/ri1");

    await user.click(screen.getByRole("button", { name: "Volver" }));
    const again = await screen.findAllByRole("article");
    expect(router.state.location.pathname).toBe("/");

    // Reseña -> página de la reseña
    await user.click(within(again[4]).getByText(/Nolan consigue que tres horas/));
    expect(await screen.findByRole("button", { name: "Volver" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/post/p5");

    await user.click(screen.getByRole("button", { name: "Volver" }));
    expect(await screen.findAllByRole("article")).toHaveLength(6);
    expect(router.state.location.pathname).toBe("/");
  });
});