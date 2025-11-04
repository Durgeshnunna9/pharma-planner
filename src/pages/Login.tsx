import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUppercaseDetected, setIsUppercaseDetected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear fields every time the component mounts
    setEmail("");
    setPassword("");
  }, []);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // ✅ Check if last character is uppercase (A–Z)
    const lastChar = value.slice(-1);
    if (/[A-Z]/.test(lastChar)) {
      setIsUppercaseDetected(true);
    } else {
      setIsUppercaseDetected(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignup) {
      // ✅ Sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const user = data.user;
      if (!user) {
        setError("User not created.");
        setLoading(false);
        return;
      }

      // ✅ Upload avatar to Supabase storage
      let avatarUrl = null;
      if (avatar) {
        const fileExt = avatar.name.split(".").pop();
        const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatar);

        if (uploadError) {
          console.error("Avatar upload error:", uploadError.message);
        } else {
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);
          avatarUrl = publicUrlData.publicUrl;
        }
      }

      // ✅ Save profile
      await supabase.from("profiles").insert([
        { id: user.id, full_name: fullName, role: "user", avatar_url: avatarUrl },
      ]);

      setLoading(false);
      navigate("/");
    } else {
      // ✅ Log in
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);

      if (loginError) {
        setError(loginError.message);
        return;
      }

      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center flex-col justify-center bg-gradient-to-br from-green-50 to-white">
      <h1 className="text-5xl font-bold mb-20">Welcome to Sansan Group</h1>

      <Card className="p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? "Create Account" : "Login"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              />
            </>
          )}

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            required
          />

          <Input
            type="password"
            onChange={handleChange}
            placeholder="Enter password"
            style={{ padding: "8px", fontSize: "16px" }}
            autoComplete="new-password"
            required
          />
          {isUppercaseDetected && (
            <p style={{ color: "red", marginTop: "8px" }}>
              ⚠️⬆️Uppercase character detected 
            </p>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
          </Button>
        </form>

        {/* Toggle */}
        <p className="mt-4 text-center text-sm">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}{" "}
          <span
            className="text-green-600 cursor-pointer hover:underline"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Login" : "Sign up"}
          </span>
        </p>

        {/* ✅ Sample Login Card */}
        <Card className="p-8 w-full max-w-md shadow-lg mt-10 pt-4">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
            Sample Login Details
          </h2>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-6 text-gray-900 text-center">
              Login Details for User
            </h3>
            <p className="text-gray-600 mb-1">
              <span className="font-semibold text-gray-800">Username:</span>{" "}
              test_view@sansan.com
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">Password:</span>{" "}
              test123
            </p>
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default Login;
