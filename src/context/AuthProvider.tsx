// src/context/AuthProvider.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../supabaseClient";

type Profile = {
  id: string;
  role: "super_admin" | "admin" | "user";
};

type AuthContextType = {
  user: any;
  profile: Profile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", userId)
        .single();
      if (error) {
        console.error("Error fetching profile:", error.message);
      }
      setProfile(data);
    };

    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      if (currentUser) getProfile(currentUser.id);
      setLoading(false);
    });

    const {
      data: subscription,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) getProfile(currentUser.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
