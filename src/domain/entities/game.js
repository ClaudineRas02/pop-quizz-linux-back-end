import { BusinessError } from "../errors/business-error.js";

const GAME_STATUSES = ["waiting", "running", "finished"];
const ANSWER_TYPES_BY_QUESTION_TYPE = {
  multiple_choice: "choice_label",
  command: "command_text",
  fill_blank: "text",
  combination: "command_text",
  shell_code: "text",
};

export function verifyGameData(gameData = {}) {
  const { title, status = "waiting", totalQuestions = 0, createdBy = null } = gameData;

  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new BusinessError("Titre du jeu invalide.", 400);
  }

  assertGameStatus(status);
  assertNonNegativeInteger(totalQuestions, "Nombre total de questions invalide.");

  return {
    title: title.trim(),
    status,
    totalQuestions,
    createdBy,
  };
}

export function verifyGameUpdate(updateData = {}) {
  const { title, status, totalQuestions } = updateData;

  if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
    throw new BusinessError("Titre du jeu invalide.", 400);
  }

  if (status !== undefined) {
    assertGameStatus(status);
  }

  if (totalQuestions !== undefined) {
    assertNonNegativeInteger(totalQuestions, "Nombre total de questions invalide.");
  }

  return {
    ...(title !== undefined ? { title: title.trim() } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(totalQuestions !== undefined ? { totalQuestions } : {}),
  };
}

export function verifyJoinPayload(payload = {}) {
  const playerId = Number(payload.playerId);

  if (!Number.isInteger(playerId) || playerId <= 0) {
    throw new BusinessError("Identifiant joueur invalide.", 400);
  }

  return { playerId };
}

export function verifyRoundPayload(payload = {}) {
  const roundNumber = Number(payload.roundNumber);
  const questionIds = payload.questionIds ?? [];

  if (!Number.isInteger(roundNumber) || roundNumber <= 0) {
    throw new BusinessError("Numero de round invalide.", 400);
  }

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw new BusinessError("La liste des questions du round est obligatoire.", 400);
  }

  return {
    roundNumber,
    questionIds: questionIds.map((questionId) => {
      const parsedQuestionId = Number(questionId);
      if (!Number.isInteger(parsedQuestionId) || parsedQuestionId <= 0) {
        throw new BusinessError("Identifiant de question invalide.", 400);
      }
      return parsedQuestionId;
    }),
  };
}

export function verifyAnswerPayload(payload = {}) {
  const playerId = Number(payload.playerId);
  const answer = payload.answer ?? payload.answerValue;

  if (!Number.isInteger(playerId) || playerId <= 0) {
    throw new BusinessError("Identifiant joueur invalide.", 400);
  }

  if (answer === undefined || answer === null || String(answer).trim() === "") {
    throw new BusinessError("Reponse invalide.", 400);
  }

  return {
    playerId,
    answer: String(answer).trim(),
  };
}

export function getAnswerTypeForQuestion(questionType) {
  const answerType = ANSWER_TYPES_BY_QUESTION_TYPE[questionType];

  if (!answerType) {
    throw new BusinessError("Type de question non supporte.", 400);
  }

  return answerType;
}

export function normalizeAnswer(answer) {
  return String(answer).trim().replace(/\s+/g, " ").toLowerCase();
}

function assertGameStatus(status) {
  if (!GAME_STATUSES.includes(status)) {
    throw new BusinessError("Statut du jeu invalide.", 400);
  }
}

function assertNonNegativeInteger(value, message) {
  if (!Number.isInteger(Number(value)) || Number(value) < 0) {
    throw new BusinessError(message, 400);
  }
}
