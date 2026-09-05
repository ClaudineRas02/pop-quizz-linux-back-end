import { describe, it } from "@jest/globals";
import assert from "node:assert/strict";
import {
  verifyQuestionData,
  verifyQuestionUpdate,
} from "../../src/domain/entities/question.js";
import { BusinessError } from "../../src/domain/errors/business-error.js";

function validQuestionData(overrides = {}) {
  return {
    statement: "Quel est le bon cmd ?",
    category: "linux",
    type: "multiple_choice",
    duration: 30,
    points: 10,
    explanation: "La reponse est ls.",
    difficulty: "medium",
    choices: [
      { label: "A", content: "ls", isCorrect: true, orderIndex: 0 },
      { label: "B", content: "cd", isCorrect: false, orderIndex: 1 },
      { label: "C", content: "rm", isCorrect: false, orderIndex: 2 },
    ],
    ...overrides,
  };
}

// =====================================================
// verifyQuestionData
// =====================================================

describe("verifyQuestionData", () => {
  it("accepte des donnees valides", () => {
    const result = verifyQuestionData(validQuestionData());
    assert.equal(result.statement, "Quel est le bon cmd ?");
    assert.equal(result.category, "linux");
    assert.equal(result.type, "multiple_choice");
    assert.equal(result.duration, 30);
    assert.equal(result.points, 10);
    assert.equal(result.difficulty, "medium");
    assert.equal(result.choices.length, 3);
  });

  it("trim le statement", () => {
    const result = verifyQuestionData(validQuestionData({ statement: "  Q?  " }));
    assert.equal(result.statement, "Q?");
  });

  it("choix vide -> pas de choix dans le retour si type != multiple_choice", () => {
    const result = verifyQuestionData(validQuestionData({ type: "command", choices: [] }));
    assert.deepEqual(result.choices, []);
  });

  // --- Erreurs ---

  it("rejette un statement vide", () => {
    assert.throws(
      () => verifyQuestionData(validQuestionData({ statement: "" })),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette un statement null", () => {
    assert.throws(
      () => verifyQuestionData(validQuestionData({ statement: null })),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette une categorie invalide", () => {
    assert.throws(
      () => verifyQuestionData(validQuestionData({ category: "math" })),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette un type invalide", () => {
    assert.throws(
      () => verifyQuestionData(validQuestionData({ type: "essay" })),
      (err) => err instanceof BusinessError && /type/i.test(err.message),
    );
  });

  it("rejette une duree zero ou negative", () => {
    assert.throws(
      () => verifyQuestionData(validQuestionData({ duration: 0 })),
      (err) => err instanceof BusinessError,
    );
    assert.throws(
      () => verifyQuestionData(validQuestionData({ duration: -5 })),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette des points zero ou negatifs", () => {
    assert.throws(
      () => verifyQuestionData(validQuestionData({ points: 0 })),
      (err) => err instanceof BusinessError,
    );
    assert.throws(
      () => verifyQuestionData(validQuestionData({ points: -10 })),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette une difficulte invalide", () => {
    assert.throws(
      () => verifyQuestionData(validQuestionData({ difficulty: "extreme" })),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette multiple_choice sans choix", () => {
    assert.throws(
      () => verifyQuestionData(validQuestionData({ choices: [] })),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette multiple_choice avec 1 seul choix", () => {
    assert.throws(
      () =>
        verifyQuestionData(
          validQuestionData({
            choices: [{ label: "A", content: "ok", isCorrect: true, orderIndex: 0 }],
          }),
        ),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette multiple_choice sans choix correct", () => {
    assert.throws(
      () =>
        verifyQuestionData(
          validQuestionData({
            choices: [
              { label: "A", content: "a", isCorrect: false, orderIndex: 0 },
              { label: "B", content: "b", isCorrect: false, orderIndex: 1 },
            ],
          }),
        ),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette un choix sans label", () => {
    assert.throws(
      () =>
        verifyQuestionData(
          validQuestionData({
            choices: [
              { label: "", content: "a", isCorrect: true, orderIndex: 0 },
              { label: "B", content: "b", isCorrect: false, orderIndex: 1 },
            ],
          }),
        ),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette un choix sans content", () => {
    assert.throws(
      () =>
        verifyQuestionData(
          validQuestionData({
            choices: [
              { label: "A", content: "", isCorrect: true, orderIndex: 0 },
              { label: "B", content: "b", isCorrect: false, orderIndex: 1 },
            ],
          }),
        ),
      (err) => err instanceof BusinessError,
    );
  });
});

// =====================================================
// verifyQuestionUpdate
// =====================================================

describe("verifyQuestionUpdate", () => {
  it("accepte un update partiel (un seul champ)", () => {
    const result = verifyQuestionUpdate({ statement: "Nouveau texte" });
    assert.equal(result.statement, "Nouveau texte");
    assert.equal(result.category, undefined);
  });

  it("accepte un update complet", () => {
    const result = verifyQuestionUpdate({
      statement: "Nouveau",
      category: "shell",
      type: "command",
      duration: 60,
      points: 20,
      explanation: "Exp",
      difficulty: "hard",
    });
    assert.equal(result.statement, "Nouveau");
    assert.equal(result.category, "shell");
    assert.equal(result.type, "command");
    assert.equal(result.duration, 60);
    assert.equal(result.points, 20);
    assert.equal(result.difficulty, "hard");
  });

  it("rejette un statement vide dans un update", () => {
    assert.throws(
      () => verifyQuestionUpdate({ statement: "" }),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette une categorie invalide dans un update", () => {
    assert.throws(
      () => verifyQuestionUpdate({ category: "invalid" }),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette des points negatifs dans un update", () => {
    assert.throws(
      () => verifyQuestionUpdate({ points: -1 }),
      (err) => err instanceof BusinessError,
    );
  });

  it("retourne un objet vide si aucun champ", () => {
    const result = verifyQuestionUpdate({});
    assert.deepEqual(result, {});
  });
});
