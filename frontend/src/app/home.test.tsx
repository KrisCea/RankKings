import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { logInAs, renderApp } from "../test/renderApp";

describe("inicio", () => {
  it("muestra el feed y el carrusel, y un visitante que intenta votar es llevado a iniciar sesión", async () => {
    const user = userEvent.setup();
    await renderApp("/");

    // Feed: 4 publicaciones de ítem y 2 reseñas (las canciones de un álbum no salen por separado)
    expect(await screen.findAllByRole("article")).toHaveLength(6);

    // Carrusel: solo publicaciones nuevas, nunca reseñas ni canciones
    expect(await screen.findAllByRole("button", { name: /Ir al destacado/ })).toHaveLength(4);

    // Sin sesión se ofrece iniciar sesión (y con eso ya se sabe que no hay cuenta activa)
    expect(await screen.findByRole("link", { name: "Iniciar sesión" })).toHaveAttribute(
      "href",
      "/login"
    );

    await user.click(screen.getAllByRole("button", { name: "Dar voto" })[0]);
    expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Inicia sesión o crea una cuenta");
  });

  it("con la sesión iniciada permite votar, puntuar, quitar la puntuación y agregar a la lista", async () => {
    logInAs("1");
    const user = userEvent.setup();
    await renderApp("/");

    const articles = await screen.findAllByRole("article");
    await screen.findByRole("button", { name: "Cristóbal" }); // la sesión ya se resolvió
    const first = within(articles[0]); // Oppenheimer

    // Votar y quitar el voto
    const vote = first.getByRole("button", { name: "Dar voto" });
    expect(vote).toHaveAttribute("aria-pressed", "false");
    expect(vote).toHaveTextContent("128");
    await user.click(vote);
    await waitFor(() => expect(vote).toHaveAttribute("aria-pressed", "true"));
    expect(vote).toHaveTextContent("129");
    await user.click(vote);
    await waitFor(() => expect(vote).toHaveAttribute("aria-pressed", "false"));
    expect(vote).toHaveTextContent("128");

    // Puntuar con el slider: suma una puntuación y muestra la nota propia
    const slider = first.getByLabelText("Puntuar");
    fireEvent.change(slider, { target: { value: "9" } });
    fireEvent.mouseUp(slider);
    expect(await first.findByText("(215)")).toBeInTheDocument();

    // Al pulsar la nota propia se quita la puntuación
    await user.click(first.getByRole("button", { name: "9.0" }));
    expect(await first.findByText("(214)")).toBeInTheDocument();
    expect(first.getByRole("button", { name: "—" })).toBeDisabled();

    // La cuenta ya tiene 3 de los 4 ítems del feed en su lista; agrega el que falta
    expect(screen.getAllByRole("button", { name: "En mi lista" })).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Agregar a mi lista" }));
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: "En mi lista" })).toHaveLength(4)
    );
  });

  it("cambia entre las vistas y abre un post de la galería en una ventana", async () => {
    const user = userEvent.setup();
    await renderApp("/");
    await screen.findAllByRole("article");

    await user.click(screen.getByRole("tab", { name: "Reels" }));
    expect(screen.getByText(/Vista de Reels/)).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);

    // La galería muestra una celda por post; las dos primeras son de Oppenheimer (publicación y reseña)
    await user.click(screen.getByRole("tab", { name: "Galería" }));
    const cells = await screen.findAllByRole("button", { name: "Ver Oppenheimer" });
    await user.click(cells[0]);

    const dialog = await screen.findByRole("dialog", { name: "Oppenheimer" });
    expect(within(dialog).getByRole("article")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Cerrar" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    await user.click(screen.getByRole("tab", { name: "Posteos" }));
    expect(await screen.findAllByRole("article")).toHaveLength(6);
  });

  it("el carrusel avanza, vuelve al principio y sigue el desplazamiento manual", async () => {
    const scrollTo = vi.fn();
    const originalScrollTo = Element.prototype.scrollTo;
    Element.prototype.scrollTo = scrollTo;
    // jsdom no calcula tamaños: cada slide mide 100 px
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get: () => 100,
    });

    try {
      const user = userEvent.setup();
      await renderApp("/");

      const next = await screen.findByRole("button", { name: "Siguiente" });
      const container = next.parentElement!.querySelector(".snap-x") as HTMLElement;

      await user.click(next);
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 100, behavior: "smooth" });

      // Desde el primero, "Anterior" salta al último (hay 4)
      await user.click(screen.getByRole("button", { name: "Anterior" }));
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 300, behavior: "smooth" });

      await user.click(screen.getByRole("button", { name: "Ir al destacado 3" }));
      expect(scrollTo).toHaveBeenLastCalledWith({ left: 200, behavior: "smooth" });

      // Un desplazamiento manual (swipe) actualiza el indicador
      Object.defineProperty(container, "scrollLeft", { configurable: true, value: 200 });
      fireEvent.scroll(container);
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Ir al destacado 3" })).toHaveClass("w-5")
      );
    } finally {
      Element.prototype.scrollTo = originalScrollTo;
      Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
    }
  });
});

describe("barra de navegación", () => {
  it("ofrece categorías, menú móvil, búsqueda y modo oscuro", async () => {
    const user = userEvent.setup();
    await renderApp("/");
    await screen.findAllByRole("article");

    // Categorías: se abre y se cierra con un clic fuera
    const categories = screen.getByRole("button", { name: "Categorías" });
    expect(categories).toHaveAttribute("aria-expanded", "false");
    await user.click(categories);
    expect(categories).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Música" })).toHaveAttribute("href", "/music");
    expect(screen.getByRole("link", { name: "Juegos de mesa" })).toHaveAttribute(
      "href",
      "/boardgames"
    );
    await user.click(document.body);
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Música" })).not.toBeInTheDocument()
    );

    // Menú móvil: suma sus propios enlaces mientras está abierto
    const menu = screen.getByRole("button", { name: "Abrir menú" });
    await user.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("link", { name: "Para ti" })).toHaveLength(2);
    await user.click(menu);
    expect(screen.getAllByRole("link", { name: "Para ti" })).toHaveLength(1);

    // Búsqueda móvil: aparece un segundo campo y se puede cerrar
    expect(screen.getAllByPlaceholderText(/^Buscar/)).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Buscar" }));
    expect(screen.getAllByPlaceholderText(/^Buscar/)).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Cerrar búsqueda" }));
    expect(screen.getAllByPlaceholderText(/^Buscar/)).toHaveLength(1);

    // Modo oscuro
    await user.click(screen.getByRole("button", { name: "Cambiar tema" }));
    expect(document.documentElement).toHaveClass("dark");
  });
});