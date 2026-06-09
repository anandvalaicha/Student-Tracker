import { useEffect, useState } from "react";
import { load, save, remove } from "../utils/storage";

const AUTH_KEY = "auth_user";

export default function useAuth() {
  const [user, setUser] = useState(() => load(AUTH_KEY, null));

  useEffect(() => {
    if (user) save(AUTH_KEY, user);
    else remove(AUTH_KEY);
  }, [user]);

  // beginner-friendly login:
  // - you can make it "accept any non-empty" OR "demo credentials"
  const login = ({ email, password }) => {
    if (!email || !password) {
      return { ok: false, message: "Email and password are required." };
    }

    // Option A (demo credentials):
    // if (email !== "anand@example.com" || password !== "1234") {
    //   return { ok: false, message: "Invalid credentials (try anand@example.com / 1234)." };
    // }

    // ✅ Accept any non-empty for now:
    setUser({
      email
    });

    return { ok: true };
  };

  const logout = () => setUser(null);

  return { user, isAuthed: Boolean(user), login, logout };
}
