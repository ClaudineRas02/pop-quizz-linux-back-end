import { AUTO_ROUND_BUCKETS } from "../constants/round-buckets.js";
import { computeBucketTargets } from "../../shared/utils/bucket-allocation.js";

export async function autoCreateRoundsForContest(
  client,
  gameId,
  requestedTotalQuestions,
) {
  const total =
    Number.isInteger(requestedTotalQuestions) && requestedTotalQuestions > 0
      ? requestedTotalQuestions
      : 0;

  if (total <= 0) {
    await syncContestTotalQuestions(client, gameId);
    return;
  }

  const targets = computeBucketTargets(total);
  const selected = [];

  for (const bucket of AUTO_ROUND_BUCKETS) {
    const ids = await pickQuestionIdsByFilter(
      client,
      bucket.whereSql,
      targets[bucket.key] ?? 0,
      selected.map((entry) => entry.questionId),
    );

    for (const questionId of ids) {
      selected.push({ questionId, roundNumber: bucket.roundNumber });
    }
  }

  const missing = total - selected.length;
  if (missing > 0) {
    const fallbackIds = await pickQuestionIdsByAllowedPools(
      client,
      missing,
      selected.map((entry) => entry.questionId),
    );

    for (const question of fallbackIds) {
      selected.push({
        questionId: question.question_id,
        roundNumber: question.category === "culture_generale" ? 1 : 2,
      });
    }
  }

  if (selected.length > 0) {
    const orderByRound = new Map();

    for (const entry of selected) {
      const currentOrder = (orderByRound.get(entry.roundNumber) ?? 0) + 1;
      orderByRound.set(entry.roundNumber, currentOrder);

      await client.query(
        `
        INSERT INTO public.contest_question (
          contest_id,
          question_id,
          round_number,
          order_index
        )
        VALUES ($1, $2, $3, $4)
        `,
        [gameId, entry.questionId, entry.roundNumber, currentOrder],
      );
    }
  }

  await syncContestTotalQuestions(client, gameId);
}

async function pickQuestionIdsByFilter(client, whereSql, limit, excludedIds) {
  if (!limit || limit <= 0) {
    return [];
  }

  const { rows } = await client.query(
    `
    SELECT question_id
    FROM public.question
    WHERE ${whereSql}
      AND ($2::integer[] IS NULL OR question_id <> ALL($2::integer[]))
    ORDER BY RANDOM()
    LIMIT $1
    `,
    [limit, excludedIds.length > 0 ? excludedIds : null],
  );

  return rows.map((row) => row.question_id);
}

async function pickQuestionIdsByAllowedPools(client, limit, excludedIds) {
  if (!limit || limit <= 0) {
    return [];
  }

  const { rows } = await client.query(
    `
    SELECT question_id, category
    FROM public.question
    WHERE (
      (category = 'culture_generale'::public.question_category AND type = 'multiple_choice'::public.question_type)
      OR (category = 'linux'::public.question_category AND type IN (
        'multiple_choice'::public.question_type,
        'command'::public.question_type,
        'combination'::public.question_type,
        'fill_blank'::public.question_type
      ))
    )
      AND ($2::integer[] IS NULL OR question_id <> ALL($2::integer[]))
    ORDER BY RANDOM()
    LIMIT $1
    `,
    [limit, excludedIds.length > 0 ? excludedIds : null],
  );

  return rows;
}

async function syncContestTotalQuestions(client, gameId) {
  await client.query(
    `
    UPDATE public.contest
    SET total_questions = (
      SELECT COUNT(*)
      FROM public.contest_question
      WHERE contest_id = $1
    )
    WHERE contest_id = $1
    `,
    [gameId],
  );
}
