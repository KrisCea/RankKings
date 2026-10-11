import { AxiosError, type AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();
const del = vi.fn();

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("VITE_USE_MOCKS", "false");
  for (const fn of [get, post, put, del]) fn.mockReset().mockResolvedValue({ data: {} });
  vi.doMock("./axios", () => ({ api: { get, post, put, delete: del } }));
});

afterEach(() => {
  vi.doUnmock("./axios");
  vi.unstubAllEnvs();
});

function httpError(status: number, message: string) {
  return new AxiosError(message, "ERR_BAD_RESPONSE", undefined, undefined, {
    status,
  } as AxiosResponse);
}

describe("contrato con el backend (VITE_USE_MOCKS=false)", () => {
  it("posts", async () => {
    const posts = await import("../features/posts/api");

    await posts.getPosts();
    expect(get).toHaveBeenLastCalledWith("/posts");
    await posts.getFeaturedPosts();
    expect(get).toHaveBeenLastCalledWith("/posts/featured");
    await posts.getPostById("p1");
    expect(get).toHaveBeenLastCalledWith("/posts/p1");
    await posts.getReviewsForItem("ri1");
    expect(get).toHaveBeenLastCalledWith("/items/ri1/reviews");
    await posts.getPostsByAuthor("ana_reviews", "review");
    expect(get).toHaveBeenLastCalledWith("/users/ana_reviews/posts", { params: { kind: "review" } });

    await posts.toggleVote("p1");
    expect(post).toHaveBeenLastCalledWith("/posts/p1/vote");
    await posts.ratePost("p1", 8);
    expect(put).toHaveBeenLastCalledWith("/posts/p1/rating", { score: 8 });
    await posts.unratePost("p1");
    expect(del).toHaveBeenLastCalledWith("/posts/p1/rating");
    await posts.sharePost("p1", "2");
    expect(post).toHaveBeenLastCalledWith("/posts/p1/share", { recipientId: "2" });
  });

  it("comentarios, ítems y biblioteca", async () => {
    const comments = await import("../features/comments/api");
    const items = await import("../features/items/api");
    const library = await import("../features/library/api");

    await comments.getComments("p1");
    expect(get).toHaveBeenLastCalledWith("/posts/p1/comments");
    await comments.addComment("p1", { text: "Hola", parentId: "c1" });
    expect(post).toHaveBeenLastCalledWith("/posts/p1/comments", { text: "Hola", parentId: "c1" });
    await comments.toggleCommentLike("c1");
    expect(post).toHaveBeenLastCalledWith("/comments/c1/like");

    await items.getItemById("ri1");
    expect(get).toHaveBeenLastCalledWith("/items/ri1");
    await items.getItemChildren("ri2");
    expect(get).toHaveBeenLastCalledWith("/items/ri2/children");
    await items.setItemSaved("ri1", true);
    expect(put).toHaveBeenLastCalledWith("/items/ri1/save");
    await items.setItemSaved("ri1", false);
    expect(del).toHaveBeenLastCalledWith("/items/ri1/save");

    await library.getSavedItems();
    expect(get).toHaveBeenLastCalledWith("/users/me/saved");
  });

  it("usuarios", async () => {
    const users = await import("../features/users/api");

    get.mockResolvedValueOnce({ data: { id: "1" } });
    await expect(users.getCurrentUser()).resolves.toEqual({ id: "1" });
    expect(get).toHaveBeenLastCalledWith("/users/me");

    // Sin sesión el servidor responde 401: para la app eso significa "visitante"
    get.mockRejectedValueOnce(httpError(401, "sin sesión"));
    await expect(users.getCurrentUser()).resolves.toBeNull();

    // Cualquier otro error se propaga
    get.mockRejectedValueOnce(httpError(500, "caído"));
    await expect(users.getCurrentUser()).rejects.toThrow("caído");

    await users.getUserProfile("ana_reviews");
    expect(get).toHaveBeenLastCalledWith("/users/ana_reviews");
    await users.toggleFollow("ana_reviews");
    expect(post).toHaveBeenLastCalledWith("/users/ana_reviews/follow");
    await users.getShareContacts();
    expect(get).toHaveBeenLastCalledWith("/users/me/share-contacts");
  });

  it("autenticación", async () => {
    const auth = await import("../features/auth/api");
    const register = {
      displayName: "Test",
      username: "test_user",
      email: "test@test.dev",
      password: "mi gato come pescado azul",
      captchaToken: "token",
    };

    await auth.login({ email: "a@b.c", password: "x" });
    expect(post).toHaveBeenLastCalledWith("/auth/login", { email: "a@b.c", password: "x" });
    await auth.registerUser(register);
    expect(post).toHaveBeenLastCalledWith("/auth/register", register);
    await auth.verifyEmail("abc");
    expect(post).toHaveBeenLastCalledWith("/auth/verify-email", { token: "abc" });
    expect(await auth.resendVerification("a@b.c")).toEqual({});
    expect(post).toHaveBeenLastCalledWith("/auth/resend-verification", { email: "a@b.c" });
    await auth.logout();
    expect(post).toHaveBeenLastCalledWith("/auth/logout");
  });
});