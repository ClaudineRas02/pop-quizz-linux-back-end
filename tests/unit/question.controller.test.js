import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createQuestionController } from "../../src/interfaces/controllers/question.controller.js";

function mockQuestionUseCases(overrides = {}) {
  return {
    listQuestions: mock.fn(async () => []),
    getQuestionById: mock.fn(async () => ({})),
    createQuestion: mock.fn(async () => ({})),
    updateQuestion: mock.fn(async () => ({})),
    deleteQuestion: mock.fn(async () => true),
    openNextQuestion: mock.fn(async () => ({})),
    closeCurrentQuestion: mock.fn(async () => ({})),
    getQuestionStats: mock.fn(async () => ({})),
    markStatsViewed: mock.fn(async () => ({})),
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
      listQuestions: mock.fn(async () => [q]),
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
      getQuestionById: mock.fn(async () => q),
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
      createQuestion: mock.fn(async () => q),
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
      updateQuestion: mock.fn(async () => q),
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
      deleteQuestion: mock.fn(async () => true),
    });

    const result = await ctrl.deleteQuestion({
      params: { questionId: "QST_1" },
    });
    assert.equal(result.statusCode, 204);
  });
});
