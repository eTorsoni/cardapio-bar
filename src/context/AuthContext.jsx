import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);
const APP_AUTH_REDIRECT = "com.cardapio.bar://login-callback";
const WEB_AUTH_REDIRECT = import.meta.env.DEV
  ? "http://localhost:5173"
  : "https://cardapio-bar.pages.dev";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let urlListener;
    let lastHandledAuthUrl = null;

    async function handleAuthRedirect(url) {
      if (!url?.startsWith(APP_AUTH_REDIRECT) || url === lastHandledAuthUrl) return;
      lastHandledAuthUrl = url;

      try {
        await Browser.close().catch(() => {});
        const callback = new URL(url);
        const oauthError = callback.searchParams.get("error_description") || callback.searchParams.get("error");
        if (oauthError) {
          console.error("Google sign-in was not completed:", oauthError);
          return;
        }

        const code = callback.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) console.error("Could not complete Google sign-in:", error);
          return;
        }

        const tokens = new URLSearchParams(callback.hash.slice(1));
        const access_token = tokens.get("access_token");
        const refresh_token = tokens.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) console.error("Could not restore Google session:", error);
        }
      } catch (error) {
        console.error("Could not process sign-in callback:", error);
      }
    }

    if (Capacitor.isNativePlatform()) {
      urlListener = App.addListener("appUrlOpen", ({ url }) => {
        void handleAuthRedirect(url);
      });
    }

    async function getInitialSession() {
      if (Capacitor.isNativePlatform()) {
        try {
          const launch = await App.getLaunchUrl();
          await handleAuthRedirect(launch?.url);
        } catch (error) {
          console.error("Could not read app launch URL:", error);
        }
      }

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (active) {
        setSession(currentSession);
        setLoading(false);
      }
    }

    void getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      if (urlListener) void urlListener.then((listener) => listener.remove());
    };
  }, []);

  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: fullName ? { full_name: fullName } : {},
        emailRedirectTo: Capacitor.isNativePlatform() ? APP_AUTH_REDIRECT : WEB_AUTH_REDIRECT,
      },
    });

    return { data, error };
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };

  const signInWithGoogle = async () => {
    const isNative = Capacitor.isNativePlatform();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: isNative ? APP_AUTH_REDIRECT : WEB_AUTH_REDIRECT,
        skipBrowserRedirect: isNative,
      },
    });

    if (error || !isNative) return { data, error };
    if (!data?.url) return { data, error: new Error("Supabase did not return a sign-in URL.") };

    try {
      await Browser.open({ url: data.url });
      return { data, error: null };
    } catch (browserError) {
      return { data, error: browserError };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}