import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { createGameUseCases } from "../../src/application/use-cases/game.use-case.js";
import { BusinessError } from "../../src/domain/errors/business-error.js";

function mockGameRepository(overrides = {}) {
  return {
    findById: mock.fn(async () => null),
    findAll: mock.fn(async () => []),
    create: mock.fn(async () => ({})),
    update: mock.fn(async () => ({})),
    delete: mock.fn(async () => true),
    start: mock.fn(async () => ({})),
    end: mock.fn(async () => ({})),
    join: mock.fn(async () => ({})),
    ...overrides,
  };
}

function mockQuestionRepository(overrides = {}) {
  return {
    findById: mock.fn(async () => null),
    ...overrides,
  };
}

function mockRoundRepository(overrides = {}) {
  return {
    addQuestionToRound: mock.fn(async () => ({})),
    getRoundsByGame: mock.fn(async () => []),
    ...overrides,
  };
}

function makeUseCases(repos = {}) {
  return createGameUseCases({
    gameRepository: repos.gameRepository ?? mockGameRepository(),
    questionRepository: repos.questionRepository ?? mockQuestionRepository(),
    roundRepository: repos.roundRepository ?? mockRoundRepository(),
  });
}

const GAME_WAITING = { gameId: "CNT_1", status: "waiting" };
const GAME_RUNNING = { gameId: "CNT_1", status: "running" };
const QUESTION = { questionId: "QST_1", statement: "Test" };
const CONTEST_QUESTION = {
  contestQuestionId: "CQN_1",
  gameId: "CNT_1",
  questionId: "QST_1",
  roundNumber: 1,
  orderIndex: 1,
};

// =====================================================
// addQuestionToRound
// =====================================================

describe("addQuestionToRound", () => {
  it("ajoute une question a un round avec succes", async () => {
    const gameRepo = mockGameRepository({
      findById: mock.fn(async () => GAME_WAITING),
    });
    const questionRepo = mockQuestionRepository({
      findById: mock.fn(async () => QUESTION),
    });
    const roundRepo = mockRoundRepository({
      addQuestionToRound: mock.fn(async () => CONTEST_QUESTION),
    });

    const useCases = makeUseCases({
      gameRepository: gameRepo,
      questionRepository: questionRepo,
      roundRepository: roundRepo,
    });

    const result = await useCases.addQuestionToRound("CNT_1", {
      roundNumber: 1,
      questionId: "QST_1",
    });

    assert.equal(result.contestQuestionId, "CQN_1");
    assert.equal(result.roundNumber, 1);
    assert.equal(roundRepo.addQuestionToRound.mock.callCount(), 1);
  });

  it("lance 404 si la partie n'existe pas", async () => {
    const useCases = makeUseCases();

    await assert.rejects(
      () => useCases.addQuestionToRound("CNT_999", {
        roundNumber: 1,
        questionId: "QST_1",
      }),
      (err) => err instanceof BusinessError && err.statusCode === 404,
    );
  });

  it("lance 409 si la partie n'est pas en attente", async () => {
    const gameRepo = mockGameRepository({
      findById: mock.fn(async () => GAME_RUNNING),
    });
    const questionRepo = mockQuestionRepository({
      findById: mock.fn(async () => QUESTION),
    });
    const roundRepo = mockRoundRepository();

    const useCases = makeUseCases({
      gameRepository: gameRepo,
      questionRepository: questionRepo,
      roundRepository: roundRepo,
    });

    await assert.rejects(
      () => useCases.addQuestionToRound("CNT_1", {
        roundNumber: 1,
        questionId: "QST_1",
      }),
      (err) => err instanceof BusinessError && err.statusCode === 409,
    );
  });

  it("lance 404 si la question n'existe pas", async () => {
    const gameRepo = mockGameRepository({
      findById: mock.fn(async () => GAME_WAITING),
    });
    const questionRepo = mockQuestionRepository({
      findById: mock.fn(async () => null),
    });

    const useCases = makeUseCases({
      gameRepository: gameRepo,
      questionRepository: questionRepo,
      roundRepository: mockRoundRepository(),
    });

    await assert.rejects(
      () => useCases.addQuestionToRound("CNT_1", {
        roundNumber: 1,
        questionId: "QST_999",
      }),
      (err) => err instanceof BusinessError && err.statusCode === 404,
    );
  });

  it("rejette un roundNumber invalide", async () => {
    const useCases = makeUseCases();

    await assert.rejects(
      () => useCases.addQuestionToRound("CNT_1", {
        roundNumber: 0,
        questionId: "QST_1",
      }),
      (err) => err instanceof BusinessError,
    );

    await assert.rejects(
      () => useCases.addQuestionToRound("CNT_1", {
        roundNumber: -1,
        questionId: "QST_1",
      }),
      (err) => err instanceof BusinessError,
    );
  });

  it("rejette un questionId vide", async () => {
    const useCases = makeUseCases();

    await assert.rejects(
      () => useCases.addQuestionToRound("CNT_1", {
        roundNumber: 1,
        questionId: "",
      }),
      (err) => err instanceof BusinessError,
    );
  });
});

// =====================================================
// getGameRounds
// =====================================================

describe("getGameRounds", () => {
  it("retourne les rounds d'une partie", async () => {
    const gameRepo = mockGameRepository({
      findById: mock.fn(async () => GAME_WAITING),
    });
    const roundRepo = mockRoundRepository({
      getRoundsByGame: mock.fn(async () => [CONTEST_QUESTION]),
    });

    const useCases = makeUseCases({
      gameRepository: gameRepo,
      roundRepository: roundRepo,
    });

    const result = await useCases.getGameRounds("CNT_1");
    assert.equal(result.length, 1);
    assert.equal(result[0].contestQuestionId, "CQN_1");
  });

  it("lance 404 si la partie n'existe pas", async () => {
    const useCases = makeUseCases();

    await assert.rejects(
      () => useCases.getGameRounds("CNT_999"),
      (err) => err instanceof BusinessError && err.statusCode === 404,
    );
  });
});
