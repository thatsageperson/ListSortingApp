import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "@/utils/api";

const DEFAULT_SETTINGS = {
  darkMode: "system",
  fontSize: "medium",
  listDensity: "comfortable",
  defaultDisplayMode: "todo-strike",
  showCompleted: true,
  defaultSort: "created",
  lastExportFormat: "text",
  exportIncludeCompleted: true,
};

async function getGuestSettings() {
  try {
    const raw = await AsyncStorage.getItem("guestSettings");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function setGuestSettings(settings) {
  try {
    await AsyncStorage.setItem("guestSettings", JSON.stringify(settings));
  } catch {}
}

export function useSettings({ isGuest = false } = {}) {
  const queryClient = useQueryClient();

  const { data: rawSettings = {} } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      if (isGuest) return getGuestSettings();
      const res = await apiFetch("/api/user/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  const settings = { ...DEFAULT_SETTINGS, ...rawSettings };

  const mutation = useMutation({
    mutationFn: async ({ key, value }) => {
      const updated = { ...rawSettings, [key]: value };
      if (isGuest) {
        await setGuestSettings(updated);
        return updated;
      }
      const res = await apiFetch("/api/user/settings", {
        method: "PUT",
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error("Failed to update setting");
      return res.json();
    },
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: ["settings"] });
      const prev = queryClient.getQueryData(["settings"]);
      queryClient.setQueryData(["settings"], (old) => ({ ...old, [key]: value }));
      return { prev };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["settings"], context.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const updateSetting = (key, value) => mutation.mutate({ key, value });

  const resetSettings = async () => {
    if (isGuest) {
      await setGuestSettings({});
      queryClient.setQueryData(["settings"], {});
      return;
    }
    await apiFetch("/api/user/settings", {
      method: "PUT",
      body: JSON.stringify({}),
    });
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  };

  return { settings, updateSetting, resetSettings };
}
