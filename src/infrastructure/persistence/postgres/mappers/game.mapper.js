export function toGame(row) {
  return {
    gameId: row.contest_id,
    title: row.title,
    status: row.status,
    createdBy: row.created_by,
    totalQuestions: row.total_questions,
    startTime: row.start_time,
    endTime: row.end_time,
    createdAt: row.created_at,
  };
}

export function toParticipant(row) {
  return {
    contestPlayerId: row.contest_player_id,
    gameId: row.contest_id,
    playerId: row.player_id,
    joinedAt: row.joined_at,
    isConnected: row.is_connected,
    lastSeen: row.last_seen,
  };
}

export function toProgress(progress) {
  return {
    answeredCount: progress.answeredCount,
    totalParticipants: progress.totalParticipants,
  };
}
