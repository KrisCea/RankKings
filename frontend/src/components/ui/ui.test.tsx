import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Avatar from "./Avatar";
import Modal from "./Modal";
import PasswordField from "./PasswordField";
import Tabs from "./Tabs";
import TextField from "./TextField";

describe("componentes base", () => {
  it("Avatar muestra la imagen con su tamaño, o la inicial si no hay imagen", () => {
    const { rerender } = render(<Avatar alt="Ana Torres" size={48} />);
    expect(screen.getByText("A")).toBeInTheDocument();

    rerender(<Avatar alt="Ana Torres" src="https://example.com/ana.png" size={48} />);
    const image = screen.getByRole("img", { name: "Ana Torres" });
    expect(image).toHaveAttribute("src", "https://example.com/ana.png");
    expect(image).toHaveStyle({ width: "48px", height: "48px" });
  });

  it("Tabs marca la pestaña activa y avisa qué pestaña se elige", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Tabs
        tabs={[
          { id: "a", label: "Uno", count: 2 },
          { id: "b", label: "Dos" },
        ]}
        active="a"
        onChange={onChange}
      />
    );

    expect(screen.getByRole("tab", { name: /Uno/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Dos" })).toHaveAttribute("aria-selected", "false");

    await user.click(screen.getByRole("tab", { name: "Dos" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("Modal se cierra con Escape, con el botón y al hacer clic en el fondo", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender, container } = render(
      <Modal open={false} title="Título" onClose={onClose}>
        contenido
      </Modal>
    );
    expect(screen.queryByText("contenido")).not.toBeInTheDocument();

    rerender(
      <Modal open title="Título" onClose={onClose}>
        contenido
      </Modal>
    );
    expect(screen.getByRole("heading", { name: "Título" })).toBeInTheDocument();
    expect(screen.getByText("contenido")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(onClose).toHaveBeenCalledTimes(2);

    // El primer elemento oculto del contenedor es el fondo oscuro
    await user.click(container.querySelector('[aria-hidden="true"]') as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it("TextField marca el error y PasswordField muestra u oculta la contraseña", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<TextField label="Correo" name="email" error="Correo inválido" />);
    expect(screen.getByLabelText("Correo")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Correo inválido")).toBeInTheDocument();
    unmount();

    render(<PasswordField label="Contraseña" name="password" />);
    const input = screen.getByLabelText("Contraseña");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Mostrar contraseña" }));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Ocultar contraseña" }));
    expect(input).toHaveAttribute("type", "password");
  });
});