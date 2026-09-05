import { describe, it, jest } from "@jest/globals";
import assert from "node:assert/strict";
import { createQuestionController } from "../../src/interfaces/controllers/question.controller.js";

function mockQuestionUseCases(overrides = {}) {
  return {
    listQuestions: jest.fn(async () => []),
    getQuestionById: jest.fn(async () => ({})),
    createQuestion: jest.fn(async () => ({})),
    updateQuestion: jest.fn(async () => ({})),
    deleteQuestion: jest.fn(async () => true),
    openNextQuestion: jest.fn(async () => ({})),
    closeCurrentQuestion: jest.fn(async () => ({})),
    getQuestionStats: jest.fn(async () => ({})),
    markStatsViewed: jest.fn(async () => ({})),
    ...overrides,
  };
}

function makeController(useCasesOverrides = {}) {
  return createQuestionController({
    questionUseCases: mockQuestionUseCases(useCasesOverrides),
  });
}

// =====================================================
// listQuestions
// =====================================================

describe("questionController.listQuestions", () => {
  it("retourne 200 avec la liste", async () => {
    const q = { questionId: "QST_1" };
    const ctrl = makeController({
      listQuestions: jest.fn(async () => [q]),
    });

    const result = await ctrl.listQuestions({});
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body.data, [q]);
  });
});

// =====================================================
// getQuestionById
// =====================================================

describe("questionController.getQuestionById", () => {
  it("retourne 200 avec la question", async () => {
    const q = { questionId: "QST_1" };
    const ctrl = makeController({
      getQuestionById: jest.fn(async () => q),
    });

    const result = await ctrl.getQuestionById({ params: { questionId: "QST_1" } });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.data.questionId, "QST_1");
  });
});

// =====================================================
// createQuestion
// =====================================================

describe("questionController.createQuestion", () => {
  it("retourne 201 avec la question creee", async () => {
    const q = { questionId: "QST_2", statement: "Test" };
    const ctrl = makeController({
      createQuestion: jest.fn(async () => q),
    });

    const result = await ctrl.createQuestion({
      body: { statement: "Test", category: "linux", type: "command", duration: 30, points: 10 },
    });
    assert.equal(result.statusCode, 201);
    assert.equal(result.body.data.questionId, "QST_2");
  });
});

// =====================================================
// updateQuestion
// =====================================================

describe("questionController.updateQuestion", () => {
  it("retourne 200 avec la question mise a jour", async () => {
    const q = { questionId: "QST_1", statement: "Updated" };
    const ctrl = makeController({
      updateQuestion: jest.fn(async () => q),
    });

    const result = await ctrl.updateQuestion({
      params: { questionId: "QST_1" },
      body: { statement: "Updated" },
    });
    assert.equal(result.statusCode, 200);
    assert.equal(result.body.data.statement, "Updated");
  });
});

// =====================================================
// deleteQuestion
// =====================================================

describe("questionController.deleteQuestion", () => {
  it("retourne 204", async () => {
    const ctrl = makeController({
      deleteQuestion: jest.fn(async () => true),
    });

    const result = await ctrl.deleteQuestion({
      params: { questionId: "QST_1" },
    });
    assert.equal(result.statusCode, 204);
  });
});
