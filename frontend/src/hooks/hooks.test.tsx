import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useCenterFocus } from "./useCenterFocus";
import { useClickOutside } from "./useClickOutside";
import { useTheme } from "./useTheme";

describe("useTheme", () => {
  it("alterna el modo oscuro, lo aplica al documento y recuerda la preferencia", () => {
    const first = renderHook(() => useTheme());
    expect(first.result.current.theme).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");

    act(() => first.result.current.toggleTheme());
    expect(first.result.current.theme).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");

    // Una nueva carga lee la preferencia guardada
    first.unmount();
    const second = renderHook(() => useTheme());
    expect(second.result.current.theme).toBe("dark");

    act(() => second.result.current.toggleTheme());
    expect(document.documentElement).not.toHaveClass("dark");
  });
});

function ClickProbe({ onOutside }: { onOutside: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onOutside);

  return (
    <div>
      <div ref={ref}>dentro</div>
      <button>fuera</button>
    </div>
  );
}

describe("useClickOutside", () => {
  it("avisa solo cuando el clic ocurre fuera del elemento", async () => {
    const user = userEvent.setup();
    const onOutside = vi.fn();
    render(<ClickProbe onOutside={onOutside} />);

    await user.click(screen.getByText("dentro"));
    expect(onOutside).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "fuera" }));
    expect(onOutside).toHaveBeenCalledTimes(1);
  });
});

const layout: Record<string, number[]> = {};

function FocusProbe({ ids }: { ids: string[] }) {
  const { containerRef, focusedId } = useCenterFocus(ids);

  return (
    <div ref={containerRef}>
      <p data-testid="focused">{focusedId ?? "ninguno"}</p>
      {ids.map((id) => (
        <div key={id} data-focus-id={id} />
      ))}
    </div>
  );
}

describe("useCenterFocus", () => {
  it("marca como enfocado el elemento que cruza el centro de la ventana", async () => {
    // jsdom no calcula posiciones: se simulan por elemento [arriba, abajo]
    const spy = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        const id = (this as HTMLElement).dataset.focusId ?? "";
        const [top = 0, bottom = 0] = layout[id] ?? [];
        return {
          top,
          bottom,
          left: 0,
          right: 0,
          width: 0,
          height: bottom - top,
          x: 0,
          y: top,
          toJSON: () => ({}),
        } as DOMRect;
      });

    // La ventana mide 768 px de alto: su centro está en y = 384
    Object.assign(layout, { a: [0, 300], b: [300, 600], c: [600, 900] });
    render(<FocusProbe ids={["a", "b", "c"]} />);
    await waitFor(() => expect(screen.getByTestId("focused")).toHaveTextContent("b"));

    // Al hacer scroll, el centro pasa a "c"
    Object.assign(layout, { a: [-500, -200], b: [-200, 100], c: [100, 400] });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    await waitFor(() => expect(screen.getByTestId("focused")).toHaveTextContent("c"));

    spy.mockRestore();
  });

  it("no hace nada cuando está desactivado", () => {
    const { result } = renderHook(() => useCenterFocus(["a"], false));
    expect(result.current.focusedId).toBeNull();
  });
});