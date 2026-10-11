import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { logInAs, renderApp } from "../test/renderApp";

describe("biblioteca", () => {
  it("pide iniciar sesión a un visitante y lo devuelve a la biblioteca después de entrar", async () => {
    const user = userEvent.setup({ delay: null });
    const { router } = await renderApp("/library");

    expect(await screen.findByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Inicia sesión o crea una cuenta");

    await user.type(screen.getByLabelText("Correo"), "crisc@rankkings.dev");
    await user.type(screen.getByLabelText("Contraseña"), "12345678");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("heading", { name: "Mi lista" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/library");
  });

  it("lista lo guardado de más reciente a más antiguo y permite filtrar por categoría", async () => {
    logInAs("1");
    const user = userEvent.setup();
    const { router } = await renderApp("/library");

    const main = within(screen.getByRole("main"));
    const all = await main.findByRole("button", { name: "Todo 4" });
    expect(all).toHaveAttribute("aria-pressed", "true");
    expect(main.getByRole("button", { name: "Música 2" })).toBeInTheDocument();
    expect(main.getByRole("button", { name: "Libros 1" })).toBeInTheDocument();
    expect(main.getByRole("button", { name: "Películas 1" })).toBeInTheDocument();

    const titles = () =>
      main.getAllByRole("listitem").map((item) => item.querySelector("p")?.textContent);
    expect(titles()).toEqual([
      "Random Access Memories",
      "Get Lucky",
      "Cien años de soledad",
      "Oppenheimer",
    ]);

    // El filtro vive en la dirección
    await user.click(main.getByRole("button", { name: "Música 2" }));
    expect(router.state.location.search).toBe("?categoria=music");
    expect(main.getByRole("button", { name: "Música 2" })).toHaveAttribute("aria-pressed", "true");
    expect(titles()).toEqual(["Random Access Memories", "Get Lucky"]);

    await user.click(main.getByRole("button", { name: "Todo 4" }));
    expect(router.state.location.search).toBe("");
    expect(titles()).toHaveLength(4);
  });

  it("respeta el filtro de la dirección y lo ignora si la categoría no existe", async () => {
    logInAs("1");

    await renderApp("/library?categoria=books");
    let main = within(screen.getByRole("main"));
    expect(await main.findByRole("button", { name: "Libros 1" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(main.getByText("Cien años de soledad")).toBeInTheDocument();
    expect(main.queryByText("Oppenheimer")).not.toBeInTheDocument();

    cleanup();
    await renderApp("/library?categoria=nada");
    main = within(screen.getByRole("main"));
    expect(await main.findByRole("button", { name: "Todo 4" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(main.getAllByRole("listitem")).toHaveLength(4);
  });

  it("quitar un ítem lo saca de la biblioteca y actualiza los filtros", async () => {
    logInAs("1");
    const user = userEvent.setup();
    await renderApp("/library?categoria=books");

    const main = within(screen.getByRole("main"));
    const book = (await main.findByText("Cien años de soledad")).closest("li")!;

    // Al quitar el único libro, el filtro desaparece y se muestra todo lo demás
    await user.click(within(book).getByRole("button", { name: "En mi lista" }));
    expect(await main.findByRole("button", { name: "Todo 3" })).toBeInTheDocument();
    expect(main.queryByRole("button", { name: /^Libros/ })).not.toBeInTheDocument();
    expect(main.getByText("Oppenheimer")).toBeInTheDocument();

    // Con una sola categoría restante ya no se ofrecen filtros
    const movie = main.getByText("Oppenheimer").closest("li")!;
    await user.click(within(movie).getByRole("button", { name: "En mi lista" }));
    await waitFor(() =>
      expect(main.queryByRole("group", { name: "Filtrar por categoría" })).not.toBeInTheDocument()
    );
    expect(main.getAllByRole("listitem")).toHaveLength(2);
  });

  it("una lista vacía invita a explorar", async () => {
    logInAs("2");
    const user = userEvent.setup();
    const { router } = await renderApp("/library");

    expect(await screen.findByText("Todavía no agregaste nada a tu lista.")).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Filtrar por categoría" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "Explorar el inicio" }));
    expect(router.state.location.pathname).toBe("/");
  });
});