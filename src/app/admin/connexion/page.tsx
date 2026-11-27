import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion admin", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="text-xl font-bold">Connexion admin</h1>
      <LoginForm />
    </div>
  );
}
