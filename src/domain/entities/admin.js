import { BusinessError } from "../errors/business-error.js";

/**
 * Crée un admin valide selon les règles métier.
 * Centralise la validation des données d’un admin.
 */
export function verifyAdmin({
  email,
  password,
  role,
  createdAt = null,
}) {
  // EMAIL obligatoire et valide
  if (!email || typeof email !== "string") {
    throw new BusinessError("L'email est obligatoire.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    throw new BusinessError("L'email est invalide.");
  }

  // PASSWORD obligatoire
  if (!password || typeof password !== "string") {
    throw new BusinessError("Le mot de passe est obligatoire.");
  }

  if (password.length < 6) {
    throw new BusinessError(
      "Le mot de passe doit contenir au moins 6 caractères.",
    );
  }

  // ROLE obligatoire et strict
  if (!role || typeof role !== "string") {
    throw new BusinessError("Le role est obligatoire.");
  }

  const normalizedRole = role.trim().toLowerCase();

  if (normalizedRole !== "admin") {
    throw new BusinessError("Le role doit etre 'admin'.");
  }

  return {
    email: normalizedEmail,
    password,
    role: normalizedRole,
    createdAt,
  };
}

/**
 * Validation des champs modifiables d’un admin
 */
export function verifyAdminUpdate({ email, password }) {
  const update = {};

  // EMAIL update
  if (email !== undefined && email !== null) {
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      throw new BusinessError("L'email est invalide.");
    }

    update.email = normalizedEmail;
  }

  // PASSWORD update
  if (password !== undefined && password !== null) {
    if (typeof password !== "string" || password.length < 6) {
      throw new BusinessError(
        "Le mot de passe doit contenir au moins 6 caractères.",
      );
    }

    update.password = password;
  }

  if (Object.keys(update).length === 0) {
    throw new BusinessError("Aucun champ modifiable fourni.");
  }

  return update;
}

/**
 * Normalisation email admin
 */
export function normalizeAdminEmail(email) {
  if (!email || typeof email !== "string") {
    throw new BusinessError("Email invalide.");
  }

  return email.trim().toLowerCase();
}

/**
 * Vérifie explicitement que le rôle est admin
 */
export function normalizeAdminRole(role) {
  const normalized = typeof role === "string" ? role.trim().toLowerCase() : role;

  if (normalized !== "admin") {
    throw new BusinessError("Le role doit etre admin.");
  }

  return normalized;
}