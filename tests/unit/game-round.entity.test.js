import { describe, it } from "@jest/globals";
import assert from "node:assert/strict";
import {
  verifyAddQuestionToRound,
} from "../../src/domain/entities/game.js";
import { BusinessError } from "../../src/domain/errors/business-error.js";

describe("verifyAddQuestionToRound", () => {
  it("accepte des donnees valides", () => {
    const result = verifyAddQuestionToRound({
      roundNumber: 1,
      questionId: "QST_00000000001",
    });
    assert.equal(result.roundNumber, 1);
    assert.equal(result.questionId, "QST_00000000001");
  });

  it("rejette roundNumber zero", () => {
    assert.throws(
      () => verifyAddQuestionToRound({ roundNumber: 0, questionId: "QST_1" }),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette roundNumber negatif", () => {
    assert.throws(
      () => verifyAddQuestionToRound({ roundNumber: -1, questionId: "QST_1" }),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette questionId vide", () => {
    assert.throws(
      () => verifyAddQuestionToRound({ roundNumber: 1, questionId: "" }),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette questionId null", () => {
    assert.throws(
      () => verifyAddQuestionToRound({ roundNumber: 1, questionId: null }),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette questionId non string", () => {
    assert.throws(
      () => verifyAddQuestionToRound({ roundNumber: 1, questionId: 123 }),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette payload vide", () => {
    assert.throws(
      () => verifyAddQuestionToRound({}),
      (err) => err instanceof BusinessError,
    );
  });
});
