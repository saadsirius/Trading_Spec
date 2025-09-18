/**
 * Un catalogue simple: code stable => message/action.
 * Les toasts affichent des messages humains et des pistes de remédiation.
 */
export type ErrorCode =
  | "NETWORK.DOWN"
  | "API.LIMIT"
  | "API.BAD_REQUEST"
  | "BROKER.REJECT"
  | "STRATEGY.INVALID_SIGNAL"
  | "ALERT.UNCONFIRMED"
  | "AUTH.MISSING_KEYS";

export const ErrorCatalog: Record<ErrorCode, { title: string; hint?: string }> = {
  "NETWORK.DOWN":        { title: "Réseau instable", hint: "Vérifie la connexion ou réessaie." },
  "API.LIMIT":           { title: "Limite API atteinte", hint: "Ralentis les appels; active le cache." },
  "API.BAD_REQUEST":     { title: "Requête invalide", hint: "Vérifie les paramètres (symbol, qty…)." },
  "BROKER.REJECT":       { title: "Ordre refusé par le broker", hint: "Regarde le détail de l'erreur broker." },
  "STRATEGY.INVALID_SIGNAL": { title: "Signal non valide", hint: "Le signal doit être confirmé par une règle." },
  "ALERT.UNCONFIRMED":   { title: "Alerte IA non confirmée", hint: "Attends la confirmation règle/volume." },
  "AUTH.MISSING_KEYS":   { title: "Clés d'API manquantes", hint: "Configure les variables d'environnement." },
};
