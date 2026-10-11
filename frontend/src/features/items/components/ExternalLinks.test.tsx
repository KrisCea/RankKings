import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ExternalLinks from "./ExternalLinks";

describe("ExternalLinks", () => {
  it("abre los enlaces seguros en otra pestaña y descarta los que no son http(s)", () => {
    render(
      <ExternalLinks
        links={[
          { id: "1", label: "Spotify", url: "https://open.spotify.com/album/1", type: "streaming" },
          { id: "2", label: "Peligroso", url: "javascript:alert(1)", type: "other" },
          { id: "3", label: "Rota", url: "esto no es una url", type: "store" },
        ]}
      />
    );

    const link = screen.getByRole("link", { name: /Spotify/ });
    expect(link).toHaveAttribute("href", "https://open.spotify.com/album/1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");

    expect(screen.queryByText("Peligroso")).not.toBeInTheDocument();
    expect(screen.queryByText("Rota")).not.toBeInTheDocument();
  });

  it("avisa cuando no hay enlaces", () => {
    render(<ExternalLinks links={[]} />);
    expect(screen.getByText("Todavía no hay enlaces para este ítem.")).toBeInTheDocument();
  });
});