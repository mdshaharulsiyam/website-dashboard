import { create } from "zustand";
import { reduxStore } from "./reduxStore";
import { authApi } from "./authApi";
import type { AuthUser } from "./authApi";

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
  currentUser: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  hasPermission: (module: string) => boolean;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["*"],
  VENDOR: ["Dashboard", "Products", "Orders", "Reviews"],
  PROFESSIONAL: ["Dashboard", "Orders", "Reviews"],
  USER: ["Dashboard"],
  RIDER: ["Dashboard", "Orders"],
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  token: null,
  isLoading: false,
  hydrated: false,

  hydrate: async () => {
    const token = localStorage.getItem("lb_token");
    if (!token) {
      set({ hydrated: true });
      return;
    }
    try {
      const result = await reduxStore
        .dispatch(authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }))
        .unwrap();
      set({ currentUser: result.data, token, hydrated: true });
    } catch {
      localStorage.removeItem("lb_token");
      set({ currentUser: null, token: null, hydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const loginResult = await reduxStore
        .dispatch(authApi.endpoints.login.initiate({ email, password }))
        .unwrap();

      localStorage.setItem("lb_token", loginResult.token);

      const profileResult = await reduxStore
        .dispatch(authApi.endpoints.getProfile.initiate(undefined, { forceRefetch: true }))
        .unwrap();

      set({
        currentUser: profileResult.data,
        token: loginResult.token,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await reduxStore
        .dispatch(authApi.endpoints.logout.initiate())
        .unwrap();
    } catch {
      // ignore logout errors
    } finally {
      localStorage.removeItem("lb_token");
      set({ currentUser: null, token: null });
    }
  },

  hasPermission: (module: string) => {
    const user = get().currentUser;
    if (!user) return false;
    const perms = ROLE_PERMISSIONS[user.role] ?? [];
    return perms.includes("*") || perms.includes(module);
  },
}));

// ─── UI Store ─────────────────────────────────────────────────────────────────

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
