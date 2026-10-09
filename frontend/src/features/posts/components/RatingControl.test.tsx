import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RatingControl from "./RatingControl";

describe("RatingControl", () => {
  it("permite puntuar y luego quitar la puntuación", () => {
    const onRate = vi.fn();
    const onUnrate = vi.fn();
    render(<RatingControl onRate={onRate} onUnrate={onUnrate} />);

    // Sin puntuar: no muestra un número y no hay nada que quitar
    const valueButton = screen.getByRole("button");
    expect(valueButton).toHaveTextContent("—");
    expect(valueButton).toBeDisabled();

    // Mueve el slider y lo suelta: puntúa con ese valor
    const slider = screen.getByLabelText("Puntuar");
    fireEvent.change(slider, { target: { value: "8" } });
    fireEvent.mouseUp(slider);
    expect(onRate).toHaveBeenCalledWith(8);
    expect(valueButton).toHaveTextContent("8.0");

    // Al pulsar el número se quita la puntuación y vuelve al estado inicial
    fireEvent.click(valueButton);
    expect(onUnrate).toHaveBeenCalledTimes(1);
    expect(valueButton).toHaveTextContent("—");
  });
});