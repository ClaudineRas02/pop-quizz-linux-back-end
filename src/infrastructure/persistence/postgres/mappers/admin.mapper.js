export function toAdmin(row) {
  return {
    adminId: row.admin_id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}
