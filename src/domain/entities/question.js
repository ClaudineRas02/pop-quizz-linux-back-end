import { BusinessError } from "../errors/business-error.js";

const VALID_CATEGORIES = ["culture_generale", "linux", "shell"];
const VALID_TYPES = ["multiple_choice", "command", "fill_blank", "combination", "shell_code"];
const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

export function verifyQuestionData(questionData = {}) {
  const {
    statement,
    category,
    type,
    duration,
    points,
    explanation = null,
    difficulty = "medium",
    choices = [],
  } = questionData;

  if (!statement || typeof statement !== "string" || statement.trim() === "") {
    throw new BusinessError("L'ennoncé de la question est obligatoire.", 400);
  }

  if (!category || !VALID_CATEGORIES.includes(category)) {
    throw new BusinessError(
      `Catégorie invalide. Valeurs acceptées : ${VALID_CATEGORIES.join(", ")}`,
      400,
    );
  }

  if (!type || !VALID_TYPES.includes(type)) {
    throw new BusinessError(
      `Type invalide. Valeurs acceptées : ${VALID_TYPES.join(", ")}`,
      400,
    );
  }

  const parsedDuration = Number(duration);
  if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
    throw new BusinessError("La durée doit être un entier positif (en secondes).", 400);
  }

  const parsedPoints = Number(points);
  if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
    throw new BusinessError("Les points doivent être un entier positif.", 400);
  }

  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    throw new BusinessError(
      `Difficulté invalide. Valeurs acceptées : ${VALID_DIFFICULTIES.join(", ")}`,
      400,
    );
  }

  if (type === "multiple_choice") {
    verifyChoices(choices);
  }

  return {
    statement: statement.trim(),
    category,
    type,
    duration: parsedDuration,
    points: parsedPoints,
    explanation: explanation ? String(explanation).trim() : null,
    difficulty,
    choices: type === "multiple_choice" ? normalizeChoices(choices) : [],
  };
}

export function verifyQuestionUpdate(updateData = {}) {
  const { statement, category, type, duration, points, explanation, difficulty, choices } = updateData;

  if (statement !== undefined && (typeof statement !== "string" || statement.trim() === "")) {
    throw new BusinessError("L'ennoncé de la question ne peut pas être vide.", 400);
  }

  if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
    throw new BusinessError(
      `Catégorie invalide. Valeurs acceptées : ${VALID_CATEGORIES.join(", ")}`,
      400,
    );
  }

  if (type !== undefined && !VALID_TYPES.includes(type)) {
    throw new BusinessError(
      `Type invalide. Valeurs acceptées : ${VALID_TYPES.join(", ")}`,
      400,
    );
  }

  if (duration !== undefined) {
    const parsedDuration = Number(duration);
    if (!Number.isInteger(parsedDuration) || parsedDuration <= 0) {
      throw new BusinessError("La durée doit être un entier positif (en secondes).", 400);
    }
  }

  if (points !== undefined) {
    const parsedPoints = Number(points);
    if (!Number.isInteger(parsedPoints) || parsedPoints <= 0) {
      throw new BusinessError("Les points doivent être un entier positif.", 400);
    }
  }

  if (difficulty !== undefined && !VALID_DIFFICULTIES.includes(difficulty)) {
    throw new BusinessError(
      `Difficulté invalide. Valeurs acceptées : ${VALID_DIFFICULTIES.join(", ")}`,
      400,
    );
  }

  if (choices !== undefined && (type === "multiple_choice" || !type)) {
    verifyChoices(choices);
  }

  const result = {};
  if (statement !== undefined) result.statement = statement.trim();
  if (category !== undefined) result.category = category;
  if (type !== undefined) result.type = type;
  if (duration !== undefined) result.duration = Number(duration);
  if (points !== undefined) result.points = Number(points);
  if (explanation !== undefined) result.explanation = explanation ? String(explanation).trim() : null;
  if (difficulty !== undefined) result.difficulty = difficulty;
  if (choices !== undefined) result.choices = normalizeChoices(choices);
  return result;
}

function verifyChoices(choices) {
  if (!Array.isArray(choices) || choices.length < 2) {
    throw new BusinessError("Une question à choix multiple doit avoir au moins 2 choix.", 400);
  }

  const hasCorrect = choices.some((c) => c.isCorrect === true);
  if (!hasCorrect) {
    throw new BusinessError("Au moins un choix doit être marqué comme correct.", 400);
  }

  choices.forEach((choice, index) => {
    if (!choice.label || typeof choice.label !== "string" || choice.label.trim() === "") {
      throw new BusinessError(`Le label du choix ${index + 1} est obligatoire.`, 400);
    }
    if (!choice.content || typeof choice.content !== "string" || choice.content.trim() === "") {
      throw new BusinessError(`Le contenu du choix ${index + 1} est obligatoire.`, 400);
    }
  });
}

function normalizeChoices(choices) {
  return choices.map((choice, index) => ({
    label: choice.label.trim(),
    content: choice.content.trim(),
    isCorrect: choice.isCorrect === true,
    orderIndex: choice.orderIndex ?? index,
  }));
}
