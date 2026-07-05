"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";

  const error = searchParams.get("error");

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "unauthorized_role":
        return {
          title: "Accès non autorisé",
          message:
            "Vous n'avez pas les permissions nécessaires pour accéder à cette zone. Contactez l'administrateur si vous pensez que c'est une erreur.",
        };
      case "not_student":
        return {
          title: "Compte non valide",
          message:
            "Vous devez être connecté avec un compte étudiant pour accéder à cet espace. Veuillez utiliser les identifiants de votre compte étudiant.",
        };
      case "session_expired":
        return {
          title: "Session expirée",
          message:
            "Votre session a expiré. Veuillez vous reconnecter pour continuer.",
        };
      case "signin":
      case "CredentialsSignin":
        return {
          title: "Erreur de connexion",
          message:
            "Les identifiants fournis sont incorrects. Veuillez réessayer.",
        };
      case "Callback":
        return {
          title: "Erreur de redirection",
          message:
            "Une erreur s'est produite lors de la redirection. Veuillez réessayer.",
        };
      default:
        return {
          title: "Erreur d'authentification",
          message:
            "Une erreur s'est produite lors du traitement de votre demande. Veuillez réessayer.",
        };
    }
  };

  const { title, message } = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0V7a2 2 0 012-2h2.586a1 1 0 00.707-.293l-2.414-2.414a1 1 0 00-1.414 1.414L10.586 7H8a1 1 0 00-1 1v1m0 0H5a2 2 0 00-2 2v2.586a1 1 0 00.293.707l2.414-2.414a1 1 0 011.414 0L7 10.586V12m0 0v2a1 1 0 001 1h1m0 0h2a2 2 0 002-2v-2.586a1 1 0 00-.293-.707l-2.414 2.414a1 1 0 01-1.414 0l-2.414-2.414A1 1 0 0012 14.586V16m0-2v-2a2 2 0 00-2-2H8a1 1 0 00-1 1v1m12-4v2m0-4V7a2 2 0 00-2-2h-2.586a1 1 0 00-.707.293l2.414 2.414a1 1 0 000 1.414L18.414 9H20a1 1 0 001-1V7m0 0h2a2 2 0 012 2v2.586a1 1 0 01-.293.707l-2.414-2.414a1 1 0 00-1.414 0l-2.414 2.414A1 1 0 0118 10.586V12m0 0v2a1 1 0 001 1h1m0 0h2a2 2 0 002-2v-2.586a1 1 0 00-.293-.707l-2.414 2.414a1 1 0 01-1.414 0l-2.414-2.414a1 1 0 01.293-.707V9.414a1 1 0 011.414 0l2.414 2.414A1 1 0 0024 10.586V8Z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            {title}
          </h1>
          <p className="text-gray-600 text-center mb-8">{message}</p>

          {/* Error Code */}
          {error && (
            <p className="text-sm text-gray-500 text-center mb-8 font-mono">
              Code: {error}
            </p>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${locale}/auth/login`)}
              className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à la connexion
            </button>

            <Link
              href={`/${locale}`}
              className="block w-full px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Retour à l\'accueil
            </Link>

            <button
              onClick={() => router.back()}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Retour
            </button>
          </div>

          {/* Support */}
          <p className="text-sm text-gray-500 text-center mt-8">
            Vous rencontrez un problème?{" "}
            <Link
              href={`/${locale}/contact`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
