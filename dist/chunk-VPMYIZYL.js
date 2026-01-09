// src/utils/auth/hooks.tsx
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
var useChronalogSession = ({
  redirectTo,
  redirectIfFound
} = {}) => {
  const router = useRouter();
  const { data, error, isLoading } = useQuery({
    queryKey: ["chronalog-session"],
    queryFn: async () => {
      const response = await fetch("/api/changelog/auth/user");
      if (!response.ok) {
        throw new Error("Failed to fetch user session");
      }
      const data2 = await response.json();
      return data2 || null;
    },
    staleTime: 1e3 * 60 * 5,
    // 5 minutes
    gcTime: 1e3 * 60 * 10,
    // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });
  const session = data?.session;
  const hasUser = Boolean(session);
  useEffect(() => {
    if (!redirectTo || isLoading) return;
    if (
      // If redirectTo is set, redirect if the user was not found.
      redirectTo && !redirectIfFound && !hasUser || // If redirectIfFound is also set, redirect if the user was found
      redirectIfFound && hasUser
    ) {
      router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, isLoading, hasUser, router]);
  if (isLoading) {
    return {
      session: null,
      status: "loading"
    };
  }
  if (data && !hasUser || error) {
    return {
      session: null,
      status: "unauthenticated"
    };
  }
  return {
    session,
    status: "authenticated"
  };
};
function useChronalogSignOut() {
  const router = useRouter();
  const signOut = () => {
    router.push("/api/changelog/auth/signout");
  };
  return { signOut };
}

export {
  useChronalogSession,
  useChronalogSignOut
};
