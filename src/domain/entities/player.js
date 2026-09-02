import { BusinessError } from "../errors/business-error.js";

export function verifyRegisterData(playerData = {}) {
  const {
    username,
    email,
    password,
    avatarUrl = null,
  } = playerData;

  if (
    !username ||
    typeof username !== "string" ||
    username.trim().length < 3
  ) {
    throw new BusinessError(
      "Le nom d'utilisateur doit contenir au moins 3 caractères.",
      400,
    );
  }

  if (
    !email ||
    typeof email !== "string" ||
    !isValidEmail(email)
  ) {
    throw new BusinessError("Adresse email invalide.", 400);
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
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
    avatarUrl,
  };
}

export function verifyLoginData(loginData = {}) {
  const { email, password } = loginData;

  if (
    !email ||
    typeof email !== "string" ||
    !isValidEmail(email)
  ) {
    throw new BusinessError("Adresse email invalide.", 400);
  }

  if (
    !password ||
    typeof password !== "string" ||
    password.trim() === ""
  ) {
    throw new BusinessError("Mot de passe invalide.", 400);
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}