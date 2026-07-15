type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export function useAuth() {
  return {
    loading: false,
    error: null as Error | null,
    user: {
      id: "local-user",
      name: "UniFind User",
      email: "student@university.ac.kr",
      role: "user",
    } satisfies AuthUser,
    isAuthenticated: true,
    logout: () => {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    },
  };
}
