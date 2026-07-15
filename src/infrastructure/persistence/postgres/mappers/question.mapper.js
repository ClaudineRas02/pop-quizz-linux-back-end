export function toOpenedQuestion(row, progress) {
  return {
    contestQuestionId: row.contest_question_id,
    gameId: row.contest_id,
    questionId: row.question_id,
    roundNumber: row.round_number,
    orderIndex: row.order_index,
    status: row.status,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    statement: row.statement,
    category: row.category,
    type: row.type,
    duration: row.duration,
    points: row.points,
    explanation: row.explanation,
    progress: toProgress(progress),
  };
}

export function toContestQuestion(row) {
  return {
    contestQuestionId: row.contest_question_id,
    gameId: row.contest_id,
    questionId: row.question_id,
    roundNumber: row.round_number,
    orderIndex: row.order_index,
    status: row.status,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
  };
}

export function toQuestionForAnswer(row) {
  return {
    contestQuestionId: row.contest_question_id,
    gameId: row.contest_id,
    questionId: row.question_id,
    status: row.status,
    type: row.type,
    points: row.points,
    duration: row.duration,
    openedAt: row.opened_at,
    correctAnswer: row.correct_answer,
  };
}

export function toQuestionStats(row) {
  return {
    contestQuestionId: row.contest_question_id,
    gameId: row.contest_id,
    questionId: row.question_id,
    roundNumber: row.round_number,
    orderIndex: row.order_index,
    status: row.status,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    statement: row.statement,
    points: row.points,
    duration: row.duration,
    totalAnswers: Number(row.total_answers),
    correctAnswers: Number(row.correct_answers),
    incorrectAnswers: Number(row.total_answers) - Number(row.correct_answers),
    firstBloodCount: Number(row.first_blood_count),
    avgResponseTime: Number(row.avg_response_time),
    correctRate: Number(row.correct_rate),
    incorrectRate: Number(row.incorrect_rate),
  };
}
