export type ErrorCode = 
  | "NETWORK_ERROR"
  | "ALPACA_API_ERROR"
  | "VALIDATION_ERROR"
  | "DATABASE_ERROR"
  | "AUTH_ERROR"
  | "RATE_LIMIT_ERROR"
  | "UNKNOWN_ERROR";

export const ErrorCatalog: Record<ErrorCode, { title: string; hint: string }> = {
  NETWORK_ERROR: {
    title: "Erreur de connexion",
    hint: "Vérifiez votre connexion internet et réessayez"
  },
  ALPACA_API_ERROR: {
    title: "Erreur API Alpaca",
    hint: "Problème avec l'API de trading. Vérifiez vos clés API."
  },
  VALIDATION_ERROR: {
    title: "Données invalides",
    hint: "Les données fournies ne sont pas valides"
  },
  DATABASE_ERROR: {
    title: "Erreur base de données",
    hint: "Problème avec la base de données. Réessayez plus tard."
  },
  AUTH_ERROR: {
    title: "Erreur d'authentification",
    hint: "Veuillez vous reconnecter"
  },
  RATE_LIMIT_ERROR: {
    title: "Limite de requêtes atteinte",
    hint: "Trop de requêtes. Attendez quelques minutes."
  },
  UNKNOWN_ERROR: {
    title: "Erreur inconnue",
    hint: "Une erreur inattendue s'est produite"
  }
};