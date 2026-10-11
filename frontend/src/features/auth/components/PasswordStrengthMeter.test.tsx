import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

describe("PasswordStrengthMeter", () => {
  it("muestra la ayuda al inicio y la seguridad de la contraseña al escribir", () => {
    const { rerender } = render(<PasswordStrengthMeter password="" />);
    expect(screen.getByText(/Mínimo 12 caracteres/)).toBeInTheDocument();

    rerender(<PasswordStrengthMeter password="corta" />);
    expect(screen.getByText("Seguridad: Muy débil")).toBeInTheDocument();

    rerender(<PasswordStrengthMeter password="Mi-gato-negro-Corre-26!" />);
    expect(screen.getByText("Seguridad: Excelente")).toBeInTheDocument();

    // Una contraseña larga pero con el usuario adentro baja a "Débil"
    rerender(<PasswordStrengthMeter password="rankingcristobal2026" personal={["cristobal"]} />);
    expect(screen.getByText("Seguridad: Débil")).toBeInTheDocument();
  });
});