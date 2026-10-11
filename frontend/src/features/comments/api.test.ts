import { describe, expect, it } from "vitest";
import { addComment, getComments, toggleCommentLike } from "./api";
import { setMockSession } from "../../mocks/accounts";

describe("api de comentarios (datos simulados)", () => {
  it("lista los comentarios por fecha y oculta los likes propios a los visitantes", async () => {
    const list = await getComments("p1");
    expect(list.map((comment) => comment.id)).toEqual(["c1", "c2", "c4"]);
    expect(list.find((comment) => comment.id === "c2")?.likedByCurrentUser).toBe(false);

    setMockSession("1");
    const asMember = await getComments("p1");
    expect(asMember.find((comment) => comment.id === "c2")?.likedByCurrentUser).toBe(true);

    expect(await getComments("p5")).toEqual([]);
  });

  it("comentar exige sesión, usa la cuenta activa como autora y permite responder", async () => {
    await expect(addComment("p5", { text: "Hola" })).rejects.toThrow(
      "Debes iniciar sesión para comentar"
    );

    setMockSession("2"); // Ana
    const root = await addComment("p5", { text: "Primer comentario" });
    expect(root.author.username).toBe("ana_reviews");
    expect(root.likesCount).toBe(0);
    expect(root.parentId).toBeUndefined();

    const reply = await addComment("p5", {
      text: "Respuesta",
      parentId: root.id,
      replyToUsername: "ana_reviews",
    });
    expect(reply.parentId).toBe(root.id);
    expect(reply.replyToUsername).toBe("ana_reviews");

    const list = await getComments("p5");
    expect(list.map((comment) => comment.text)).toEqual(["Primer comentario", "Respuesta"]);
  });

  it("dar like a un comentario exige sesión y se puede quitar", async () => {
    await expect(toggleCommentLike("c1")).rejects.toThrow("Debes iniciar sesión");

    setMockSession("1");
    const liked = await toggleCommentLike("c1");
    expect(liked.likedByCurrentUser).toBe(true);
    expect(liked.likesCount).toBe(13);

    const unliked = await toggleCommentLike("c1");
    expect(unliked.likedByCurrentUser).toBe(false);
    expect(unliked.likesCount).toBe(12);

    await expect(toggleCommentLike("c999")).rejects.toThrow("Comentario no encontrado");
  });
});