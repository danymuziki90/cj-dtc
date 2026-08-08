"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "en" ? "en" : "fr";
  const copy = locale === "en"
    ? {
        missingToken: "This reset link is missing or invalid.",
        requestNew: "Request a new link",
        title: "Reset your password",
        password: "New password",
        confirm: "Confirm password",
        submit: "Reset password",
        submitting: "Updating...",
        success: "Password updated!",
        redirect: "You will be redirected to the sign-in page...",
        mismatch: "Passwords do not match.",
        minimum: "Your password must contain at least 8 characters.",
        unavailable: "An unexpected error occurred. Please try again.",
      }
    : {
        missingToken: "Lien invalide ou incomplet.",
        requestNew: "Demander un nouveau lien",
        title: "Réinitialisation du mot de passe",
        password: "Nouveau mot de passe",
        confirm: "Confirmer le mot de passe",
        submit: "Modifier le mot de passe",
        submitting: "Modification...",
        success: "Mot de passe modifié !",
        redirect: "Vous allez être redirigé vers la page de connexion...",
        mismatch: "Les mots de passe ne correspondent pas.",
        minimum: "Le mot de passe doit contenir au moins 8 caractères.",
        unavailable: "Une erreur temporaire est survenue. Veuillez réessayer.",
      };
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError(
        copy.missingToken,
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(copy.mismatch);
      return;
    }

    if (password.length < 8) {
      setError(copy.minimum);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/student/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password, locale }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/${locale}/auth/student-login?reset=success`);
        }, 3000);
      } else {
        setError(data.error || "Erreur lors de la réinitialisation");
      }
    } catch (err) {
      setError(copy.unavailable);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <p className="text-red-600">{copy.missingToken}</p>
          <Link
            href={`/${locale}/auth/forgot-password`}
            className="text-blue-600 mt-4 block"
          >
            {copy.requestNew}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {copy.title}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    {copy.success}
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>{copy.redirect}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  {copy.password}
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  {copy.confirm}
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? copy.submitting : copy.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
