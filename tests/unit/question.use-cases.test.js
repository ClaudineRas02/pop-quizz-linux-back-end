import { describe, it, jest } from "@jest/globals";
import assert from "node:assert/strict";
import { createQuestionUseCases } from "../../src/application/use-cases/questions.use-cases.js";
import { BusinessError } from "../../src/domain/errors/business-error.js";

function mockQuestionRepository(overrides = {}) {
  return {
    findAll: jest.fn(async () => []),
    findById: jest.fn(async () => null),
    create: jest.fn(async (data) => ({ questionId: "QST_00000000001", ...data })),
    update: jest.fn(async (id, data) => ({ questionId: id, ...data })),
    delete: jest.fn(async () => true),
    findOpenedQuestion: jest.fn(async () => null),
    findNextWaitingQuestion: jest.fn(async () => null),
    openQuestion: jest.fn(async () => {}),
    closeQuestion: jest.fn(async () => ({})),
    getQuestionProgress: jest.fn(async () => ({ totalParticipants: 0, answeredCount: 0 })),
    findCurrentQuestionForStatistics: jest.fn(async () => null),
    ...overrides,
  };
}

function mockGameRepository(overrides = {}) {
  return {
    findById: jest.fn(async () => null),
    ...overrides,
  };
}

function mockStatisticRepository(overrides = {}) {
  return {
    getQuestionStatistics: jest.fn(async () => null),
    markStatsViewed: jest.fn(async () => null),
    ...overrides,
  };
}

function makeUseCases(repos = {}) {
  return createQuestionUseCases({
    gameRepository: repos.gameRepository ?? mockGameRepository(),
    questionRepository: repos.questionRepository ?? mockQuestionRepository(),
    statisticRepository: repos.statisticRepository ?? mockStatisticRepository(),
  });
}

function validPayload() {
  return {
    statement: "Quel cmd list les fichiers ?",
    category: "linux",
    type: "multiple_choice",
    duration: 30,
    points: 10,
    difficulty: "medium",
    choices: [
      { label: "A", content: "ls", isCorrect: true, orderIndex: 0 },
      { label: "B", content: "pwd", isCorrect: false, orderIndex: 1 },
      { label: "C", content: "cat", isCorrect: false, orderIndex: 2 },
    ],
  };
}

// =====================================================
// listQuestions
// =====================================================

describe("listQuestions", () => {
  it("retourne la liste du repository", async () => {
    const q1 = { questionId: "QST_00000000001", statement: "Q1" };
    const repo = mockQuestionRepository({
      findAll: jest.fn(async () => [q1]),
    });
    const useCases = makeUseCases({ questionRepository: repo });

    const result = await useCases.listQuestions();
    assert.equal(result.length, 1);
    assert.equal(result[0].questionId, "QST_00000000001");
  });
});

// =====================================================
// getQuestionById
// =====================================================

describe("getQuestionById", () => {
  it("retourne la question si elle existe", async () => {
    const q = { questionId: "QST_00000000001", statement: "Q?" };
    const repo = mockQuestionRepository({
      findById: jest.fn(async () => q),
    });
    const useCases = makeUseCases({ questionRepository: repo });

    const result = await useCases.getQuestionById("QST_00000000001");
    assert.equal(result.questionId, "QST_00000000001");
  });

  it("lance 404 si introuvable", async () => {
    const useCases = makeUseCases();
    await assert.rejects(
      () => useCases.getQuestionById("QST_99999999999"),
      (err) => err instanceof BusinessError && err.statusCode === 404,
    );
  });
});

// =====================================================
// createQuestion
// =====================================================

describe("createQuestion", () => {
  it("cree une question avec des donnees valides", async () => {
    const repo = mockQuestionRepository();
    const useCases = makeUseCases({ questionRepository: repo });

    const result = await useCases.createQuestion(validPayload());
    assert.equal(result.questionId, "QST_00000000001");
    assert.equal(result.statement, "Quel cmd list les fichiers ?");
    assert.equal(repo.create.mock.calls.length, 1);
  });

  it("rejette des donnees invalides", async () => {
    const useCases = makeUseCases();
    await assert.rejects(
      () => useCases.createQuestion({ statement: "" }),
      (err) => err instanceof BusinessError,
    );
  });
});

// =====================================================
// updateQuestion
// =====================================================

describe("updateQuestion", () => {
  it("met a jour une question existante", async () => {
    const repo = mockQuestionRepository({
      findById: jest.fn(async () => ({ questionId: "QST_00000000001", statement: "Old" })),
      update: jest.fn(async (id, data) => ({ questionId: id, ...data })),
    });
    const useCases = makeUseCases({ questionRepository: repo });

    const result = await useCases.updateQuestion("QST_00000000001", {
      statement: "New statement",
    });
    assert.equal(result.statement, "New statement");
    assert.equal(repo.update.mock.calls.length, 1);
  });

  it("lance 404 si la question n'existe pas", async () => {
    const useCases = makeUseCases();
    await assert.rejects(
      () => useCases.updateQuestion("QST_99999999999", { statement: "X" }),
      (err) => err instanceof BusinessError && err.statusCode === 404,
    );
  });

  it("rejette des donnees invalides", async () => {
    const repo = mockQuestionRepository({
      findById: jest.fn(async () => ({ questionId: "QST_00000000001" })),
    });
    const useCases = makeUseCases({ questionRepository: repo });

    await assert.rejects(
      () => useCases.updateQuestion("QST_00000000001", { category: "invalid" }),
      (err) => err instanceof BusinessError,
    );
  });
});

// =====================================================
// deleteQuestion
// =====================================================

describe("deleteQuestion", () => {
  it("supprime une question existante", async () => {
    const repo = mockQuestionRepository({
      findById: jest.fn(async () => ({ questionId: "QST_00000000001" })),
      delete: jest.fn(async () => true),
    });
    const useCases = makeUseCases({ questionRepository: repo });

    const result = await useCases.deleteQuestion("QST_00000000001");
    assert.equal(result, true);
    assert.equal(repo.delete.mock.calls.length, 1);
  });

  it("lance 404 si la question n'existe pas", async () => {
    const useCases = makeUseCases();
    await assert.rejects(
      () => useCases.deleteQuestion("QST_99999999999"),
      (err) => err instanceof BusinessError && err.statusCode === 404,
    );
  });
});
