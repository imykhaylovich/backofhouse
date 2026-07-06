/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import { AuthAPI } from "../api/client";

const AuthCtx = createContext(null);

function decode(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function validToken() {
  const t = localStorage.getItem("boh.token");
  if (!t) return null;
  const c = decode(t);
  if (!c || (c.exp && c.exp * 1000 < Date.now())) {
    localStorage.removeItem("boh.token");
    return null;
  }
  return t;
}

const profileKey = (orgId) => `boh.profile.${orgId}`;
const onboardKey = (orgId) => `boh.onboarded.${orgId}`;

function readProfile(orgId) {
  try {
    return JSON.parse(localStorage.getItem(profileKey(orgId))) ?? {};
  } catch {
    return {};
  }
}

/**
 * The backend's JWT only carries user_id/org_id and there is no /auth/me yet,
 * so org name/type and the user's name live in localStorage. Registration
 * fills them in; a sign-in on a fresh browser goes through the onboarding
 * questionnaire instead.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(validToken);
  const claims = useMemo(() => (token ? decode(token) : null), [token]);
  const [profile, setProfile] = useState(() => (claims ? readProfile(claims.org_id) : null));
  const [onboarded, setOnboarded] = useState(() =>
    claims ? localStorage.getItem(onboardKey(claims.org_id)) === "1" : false
  );

  function adopt(nextToken, patch = {}) {
    const c = decode(nextToken);
    localStorage.setItem("boh.token", nextToken);
    const merged = { ...readProfile(c.org_id), ...patch };
    localStorage.setItem(profileKey(c.org_id), JSON.stringify(merged));
    setToken(nextToken);
    setProfile(merged);
    setOnboarded(localStorage.getItem(onboardKey(c.org_id)) === "1");
  }

  async function login(email, password) {
    const { access_token } = await AuthAPI.login(email, password);
    adopt(access_token);
  }

  async function register(orgData, userData) {
    // UserCreate requires org_id even though the server assigns the real one.
    const { access_token } = await AuthAPI.register(orgData, { ...userData, org_id: 0 });
    adopt(access_token, { orgName: orgData.name, orgType: orgData.type, name: userData.name });
  }

  function updateProfile(patch) {
    if (!claims) return;
    const merged = { ...readProfile(claims.org_id), ...patch };
    localStorage.setItem(profileKey(claims.org_id), JSON.stringify(merged));
    setProfile(merged);
  }

  function completeOnboarding() {
    if (claims) localStorage.setItem(onboardKey(claims.org_id), "1");
    setOnboarded(true);
  }

  function logout() {
    localStorage.removeItem("boh.token");
    setToken(null);
    setProfile(null);
    setOnboarded(false);
  }

  const value = {
    token,
    claims,
    profile,
    onboarded,
    login,
    register,
    logout,
    updateProfile,
    completeOnboarding,
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
