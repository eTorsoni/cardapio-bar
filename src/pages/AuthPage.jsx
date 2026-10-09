import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";
import SignUpForm from "../components/SignUpForm";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <AuthLayout
      title="Login"
      subtitle="Acesse seu painel e gerencie o cardápio do bar."
      footerText="Não tem conta?"
      footerLink="Cadastre-se"
      onFooterClick={() => setIsLogin(false)}
    >
      <LoginForm />
    </AuthLayout>
  ) : (
    <AuthLayout
      title="Sign Up"
      subtitle="Crie sua conta para controlar produtos, promoções e combos."
      footerText="Já tem conta?"
      footerLink="Faça login"
      onFooterClick={() => setIsLogin(true)}
    >
      <SignUpForm />
    </AuthLayout>
  );
}

export default AuthPage;
