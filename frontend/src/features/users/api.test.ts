import { describe, expect, it } from "vitest";
import { getCurrentUser, getShareContacts, getUserProfile, toggleFollow } from "./api";
import { setMockSession } from "../../mocks/accounts";

describe("api de usuarios (datos simulados)", () => {
  it("devuelve la cuenta de la sesión, o nada para un visitante", async () => {
    expect(await getCurrentUser()).toBeNull();

    setMockSession("1");
    expect((await getCurrentUser())?.username).toBe("crisc");

    setMockSession("2");
    const ana = await getCurrentUser();
    expect(ana?.username).toBe("ana_reviews");
    expect(ana?.role).toBe("user");
  });

  it("devuelve el perfil público de un usuario", async () => {
    const sony = await getUserProfile("sonymusic");
    expect(sony.accountType).toBe("business");
    expect(sony.isVerifiedBusiness).toBe(true);

    await expect(getUserProfile("nadie")).rejects.toThrow("Usuario no encontrado");
  });

  it("seguir exige sesión, actualiza los seguidores y no permite seguirse a uno mismo", async () => {
    await expect(toggleFollow("ana_reviews")).rejects.toThrow(
      "Debes iniciar sesión para seguir a otros usuarios"
    );

    setMockSession("1");
    const followed = await toggleFollow("ana_reviews");
    expect(followed.isFollowedByCurrentUser).toBe(true);
    expect(followed.followersCount).toBe(1241);

    const unfollowed = await toggleFollow("ana_reviews");
    expect(unfollowed.isFollowedByCurrentUser).toBe(false);
    expect(unfollowed.followersCount).toBe(1240);

    await expect(toggleFollow("crisc")).rejects.toThrow("No puedes seguirte a ti mismo");
    await expect(toggleFollow("nadie")).rejects.toThrow("Usuario no encontrado");
  });

  it("ofrece como contactos a todos menos a quien tiene la sesión", async () => {
    expect(await getShareContacts()).toHaveLength(3);

    setMockSession("2");
    expect((await getShareContacts()).map((user) => user.id)).toEqual(["3", "4"]);
  });
});