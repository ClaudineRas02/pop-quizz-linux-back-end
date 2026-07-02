import { BusinessError } from "../errors/business-error.js";

export function verifyRegisterData(adminData = {}) {
  const {
    email,
    password,
  } = adminData;

  if (
    !email ||
    typeof email !== "string" ||
    !isValidEmail(email)
  ) {
    throw new BusinessError(
      "Adresse email invalide.",
      400,
    );
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    throw new BusinessError(
      "Le mot de passe doit contenir au moins 8 caractères.",
      400,
    );
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
}

export function verifyLoginData(loginData = {}) {
  const { email, password } = loginData;

  if (
    !email ||
    typeof email !== "string" ||
    !isValidEmail(email)
  ) {
    throw new BusinessError(
      "Adresse email invalide.",
      400,
    );
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.trim() === ""
  ) {
    throw new BusinessError(
      "Mot de passe invalide.",
      400,
    );
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}