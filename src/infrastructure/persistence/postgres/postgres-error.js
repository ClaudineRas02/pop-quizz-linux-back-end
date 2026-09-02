// Gestion des erreurs PostgreSQL les plus courantes.
import { BusinessError } from "../../../domain/errors/business-error.js";
import { query } from "./db.js";

export async function queryWithBusinessErrors(sql, params) {
  try {
    return await query(sql, params);
  } catch (error) {
    // Violation de contrainte.
    switch (error.code) {
      case "23514":
        throw new BusinessError(
          "Violation de contrainte dans DB.Vous vous devez respecter les regles de validation definies pour cette operation.",
          409,
        );
      default:
        throw error;
    }
  }
}
