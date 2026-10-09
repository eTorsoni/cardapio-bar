import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function LoginForm({ onSwitch }) {
  const { signIn, signInWithGoogle } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await signIn({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError(signInError.message || "Não foi possível entrar.");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <>
      <button
        type="button"
        className="auth-google-btn"
        onClick={async () => {
          const { error } = await signInWithGoogle();

          if (error) {
            setError(error.message || "Não foi possível entrar com o Google.");
          }
        }}
      >
        <span className="auth-google-icon">G</span>
        Entrar com Google
      </button>

      <div className="auth-divider"><span>ou</span></div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          E-mail
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="seu@email.com"
            required
          />
        </label>

        <label>
          Senha
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </>
  );
}

export default LoginForm;
