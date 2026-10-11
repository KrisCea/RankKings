import { describe, expect, it } from "vitest";
import {
  getFeaturedPosts,
  getPostById,
  getPosts,
  getPostsByAuthor,
  getReviewsForItem,
  ratePost,
  sharePost,
  toggleVote,
  unratePost,
} from "./api";
import { setMockSession } from "../../mocks/accounts";

const ids = (posts: { id: string }[]) => posts.map((post) => post.id);

describe("api de posts (datos simulados)", () => {
  it("arma el feed y los destacados, y adapta lo personal a quien consulta", async () => {
    // Feed: ítems nuevos y reseñas; las canciones de un álbum no salen por separado
    expect(ids(await getPosts())).toEqual(["p1", "p2", "p3", "p4", "p5", "p6"]);

    // Destacados: solo ítems nuevos, de mayor a menor puntuación
    expect(ids(await getFeaturedPosts())).toEqual(["p3", "p2", "p1", "p4"]);

    // Un visitante no tiene votos, puntuaciones ni lista propios
    const asVisitor = (await getPosts()).find((post) => post.id === "p2")!;
    expect(asVisitor.votedByCurrentUser).toBe(false);
    expect(asVisitor.currentUserRating).toBeUndefined();
    expect(asVisitor.rankableItem.savedByCurrentUser).toBe(false);

    // Con sesión se ve lo propio
    setMockSession("1");
    const asMember = (await getPosts()).find((post) => post.id === "p2")!;
    expect(asMember.votedByCurrentUser).toBe(true);
    expect(asMember.currentUserRating).toBe(9.5);
    expect(asMember.rankableItem.savedByCurrentUser).toBe(true);
  });

  it("busca posts por id, por ítem reseñado y por autor", async () => {
    expect((await getPostById("p5")).kind).toBe("review");
    await expect(getPostById("no-existe")).rejects.toThrow("Post no encontrado");

    expect(ids(await getReviewsForItem("ri1"))).toEqual(["p5"]);
    expect(ids(await getReviewsForItem("ri2"))).toEqual(["p6"]);
    expect(await getReviewsForItem("ri3")).toEqual([]);

    expect(ids(await getPostsByAuthor("ana_reviews", "item"))).toEqual(["p1"]);
    expect(ids(await getPostsByAuthor("ana_reviews", "review"))).toEqual(["p6"]);
    expect(ids(await getPostsByAuthor("sonymusic", "item"))).toEqual(["p2"]); // sus canciones no salen aparte
    expect(await getPostsByAuthor("crisc", "review")).toEqual([]);
  });

  it("votar exige sesión y alterna el voto", async () => {
    await expect(toggleVote("p3")).rejects.toThrow("Debes iniciar sesión");

    setMockSession("1");
    const voted = await toggleVote("p3");
    expect(voted.votedByCurrentUser).toBe(true);
    expect(voted.votesCount).toBe(90);
    expect((await getPostById("p3")).votesCount).toBe(90);

    const unvoted = await toggleVote("p3");
    expect(unvoted.votedByCurrentUser).toBe(false);
    expect(unvoted.votesCount).toBe(89);

    await expect(toggleVote("no-existe")).rejects.toThrow("Post no encontrado");
  });

  it("puntúa, cambia y quita una puntuación recalculando el promedio", async () => {
    await expect(ratePost("p5", 8)).rejects.toThrow("Debes iniciar sesión");
    setMockSession("1");

    const rated = await ratePost("p5", 10); // partía de 7.8 con 36 puntuaciones
    expect(rated.currentUserRating).toBe(10);
    expect(rated.ratingsCount).toBe(37);
    expect(rated.averageRating).toBe(7.9);

    const changed = await ratePost("p5", 5); // cambiarla no suma otra puntuación
    expect(changed.ratingsCount).toBe(37);
    expect(changed.averageRating).toBe(7.8);

    const removed = await unratePost("p5");
    expect(removed.currentUserRating).toBeUndefined();
    expect(removed.ratingsCount).toBe(36);
    expect(removed.averageRating).toBe(7.9);

    // Quitar una puntuación que no existe no cambia nada
    expect((await unratePost("p6")).ratingsCount).toBe(52);

    await expect(ratePost("no-existe", 5)).rejects.toThrow("Post no encontrado");
    await expect(unratePost("no-existe")).rejects.toThrow("Post no encontrado");
  });

  it("compartir exige sesión y suma al contador", async () => {
    await expect(sharePost("p4", "2")).rejects.toThrow("Debes iniciar sesión");

    setMockSession("1");
    expect((await sharePost("p4", "2")).sharesCount).toBe(7);
    await expect(sharePost("no-existe", "2")).rejects.toThrow("Post no encontrado");
  });
});