export function toLeaderboardRow(row) {
  return {
    gameId: row.contest_id,
    playerId: row.player_id,
    username: row.username,
    avatarUrl: row.avatar_url,
    score: Number(row.score),
    correctAnswers: Number(row.correct_answers),
    wrongAnswers: Number(row.wrong_answers),
    firstBloodCount: Number(row.first_blood_count),
    avgResponseTime: Number(row.avg_response_time),
    rank: Number(row.rank),
  };
}
