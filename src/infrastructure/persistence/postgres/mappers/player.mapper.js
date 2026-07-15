export function toPlayer(row) {
  return {
    playerId: row.player_id,
    username: row.username,
    email: row.email,
    avatarUrl: row.avatar_url,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}
