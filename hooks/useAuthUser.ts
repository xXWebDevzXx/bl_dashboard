"use client";

import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Not authenticated");
    throw error;
  }
  return res.json();
};

export function useAuthUser() {
  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  return {
    user: user || null,
    error,
    isLoading,
    mutate,
  };
}
