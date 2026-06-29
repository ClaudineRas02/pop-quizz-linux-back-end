import { BusinessError } from "../errors/business-error.js";

// Validation des champs pour la creation d'un utilisateur.
// Centralise les regles de validation pour le controller d'auth.
export function verifyNewUser({
  email,
  username = "",
  telephone = "",
  sex = "M",
}) {
  if (!email || typeof email !== "string") {
    throw new BusinessError("L'email est requis.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new BusinessError("L'email est invalide.");
  }

  if (!username || typeof username !== "string" || username.trim().length < 2) {
    throw new BusinessError(
      "Le nom d'utilisateur est requis (2 caracteres min).",
    );
  }

  const phone = String(telephone ?? "").trim();
  // Autorise chiffres et un + initial, longueur raisonnable
  const phoneRegex = /^\+?[0-9]{6,15}$/;
  if (phone && !phoneRegex.test(phone)) {
    throw new BusinessError("Le numero de telephone est invalide.");
  }

  const normalizedSex =
    typeof sex === "string" ? sex.trim().toUpperCase() : sex;
  if (normalizedSex !== "M" && normalizedSex !== "F") {
    throw new BusinessError("Le sexe doit etre 'M' ou 'F'.");
  }

  return {
    email: normalizedEmail,
    username: username.trim(),
    telephone: phone || "",
    sex: normalizedSex,
  };
}

// Valide la solidité et le format du mot de passe.
// Placez ici les regles de complexité (longueur minimale, presence de chifres, etc.).
export function verifyPassword(password) {
  if (!password || typeof password !== "string") {
    throw new BusinessError("Le mot de passe est requis.");
  }

  const minLength = 6; // règle simple pour projet de classe
  if (password.length < minLength) {
    throw new BusinessError(
      `Le mot de passe doit contenir au moins ${minLength} caractères.`,
    );
  }

  // Exemple d'exigence optionnelle : au moins un chiffre
  const digitRegex = /[0-9]/;
  if (!digitRegex.test(password)) {
    throw new BusinessError(
      "Le mot de passe doit contenir au moins un chiffre.",
    );
  }

  return true;
}
