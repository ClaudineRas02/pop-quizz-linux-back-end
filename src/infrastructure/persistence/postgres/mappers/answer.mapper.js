export function toAnswer(row) {
  return {
    answerId: row.answer_id,
    contestQuestionId: row.contest_question_id,
    playerId: row.player_id,
    answerValue: row.answer_value,
    answerType: row.answer_type,
    isCorrect: row.is_correct,
    responseTime: row.response_time,
    firstBlood: row.first_blood,
    earnedPoints: row.earned_points,
    submittedAt: row.submitted_at,
  };
}
