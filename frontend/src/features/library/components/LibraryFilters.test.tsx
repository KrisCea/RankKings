import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LibraryFilters from "./LibraryFilters";

describe("LibraryFilters", () => {
  it("muestra los contadores por categoría y avisa qué filtro se elige", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <LibraryFilters
        options={[
          { id: "music", label: "Música", count: 2 },
          { id: "books", label: "Libros", count: 1 },
        ]}
        total={3}
        active="music"
        onChange={onChange}
      />
    );

    // Contadores y filtro activo
    expect(screen.getByRole("button", { name: "Todo 3" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "Música 2" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Libros 1" })).toHaveAttribute("aria-pressed", "false");

    // Elegir una categoría y volver a "Todo"
    await user.click(screen.getByRole("button", { name: "Libros 1" }));
    expect(onChange).toHaveBeenLastCalledWith("books");

    await user.click(screen.getByRole("button", { name: "Todo 3" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});