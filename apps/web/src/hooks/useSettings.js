import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useUser from "@/utils/useUser";

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

function getGuestSettings() {
  try {
    const raw = localStorage.getItem("guestSettings");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setGuestSettings(settings) {
  try {
    localStorage.setItem("guestSettings", JSON.stringify(settings));
  } catch {}
}

export function useSettings() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  const isGuest =
    typeof window !== "undefined" && localStorage.getItem("guestMode") === "true";
  const isLoggedIn = !!user && !isGuest;

  const { data: rawSettings = {} } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!isLoggedIn) return getGuestSettings();
      const res = await fetch("/api/user/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  const settings = { ...DEFAULT_SETTINGS, ...rawSettings };

  const mutation = useMutation({
    mutationFn: async ({ key, value }) => {
      const updated = { ...rawSettings, [key]: value };
      if (!isLoggedIn) {
        setGuestSettings(updated);
        return updated;
      }
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    if (!isLoggedIn) {
      setGuestSettings({});
      queryClient.setQueryData(["settings"], {});
      return;
    }
    await fetch("/api/user/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  };

  return { settings, updateSetting, resetSettings };
}
