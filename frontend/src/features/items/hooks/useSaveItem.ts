import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setItemSaved } from "../api";
import { syncItemInCache } from "../cache";
import type { SavedItem } from "../../../types/savedItem";

interface SaveParams {
  itemId: string;
  saved: boolean; // estado deseado: true agrega a la lista, false la quita
}

export function useSaveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, saved }: SaveParams) => setItemSaved(itemId, saved),

    onSuccess: (updatedItem, { saved }) => {
      syncItemInCache(queryClient, updatedItem);

      // Al quitar, desaparece de la biblioteca al instante, sin esperar la recarga
      if (!saved) {
        queryClient.setQueryData<SavedItem[]>(["savedItems"], (old) =>
          old?.filter((entry) => entry.item.id !== updatedItem.id)
        );
      }

      void queryClient.invalidateQueries({ queryKey: ["savedItems"] });
    },
  });
}