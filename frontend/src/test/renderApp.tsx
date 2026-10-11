import { render } from "@testing-library/react";
import { vi } from "vitest";

export const SESSION_KEY = "mockSessionUserId";

// Inicia sesión como una cuenta de prueba: "1" crisc, "2" ana, "3" sony, "4" pedro
export function logInAs(userId: string) {
  localStorage.setItem(SESSION_KEY, userId);
}

export async function renderApp(route = "/") {
  vi.resetModules();
  const [{ routes }, { QueryClient, QueryClientProvider }, { createMemoryRouter, RouterProvider }] =
    await Promise.all([
      import("../app/routes"),
      import("@tanstack/react-query"),
      import("react-router-dom"),
    ]);

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter(routes, { initialEntries: [route] });

  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );

  return { ...utils, router };
}