import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function SignUpForm({ onSwitch }) {
  const { signUp, signInWithGoogle } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: signUpError } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
    });

    if (signUpError) {
      setError(signUpError.message || "Não foi possível realizar o cadastro.");
      setLoading(false);
      return;
    }

    setMessage("Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.");
    setLoading(false);
    setForm({ fullName: "", email: "", password: "" });
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
        Cadastrar com Google
      </button>

      <div className="auth-divider"><span>ou</span></div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Nome completo
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="Seu nome"
            required
          />
        </label>

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
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </>
  );
}

export default SignUpForm;
