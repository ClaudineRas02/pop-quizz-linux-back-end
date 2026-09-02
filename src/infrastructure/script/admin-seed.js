import bcrypt from "bcrypt";
import { query } from "../persistence/postgres/db.js";

async function seedAdmin() {
  try {
    const password = "Admin123!";
    const hash = await bcrypt.hash(password, 10);

    // Vérifie si un admin existe déjà
    const existing = await query(
      `
      SELECT admin_id
      FROM public.admin
      LIMIT 1
      `,
    );

    if (existing.rows.length > 0) {
      console.log("Un administrateur existe déjà.");
      process.exit(0);
    }

    await query(
      `
      INSERT INTO public.admin (
        email,
        password_hash
      )
      VALUES (
        'email@gmail.com',
        $1
      )
      `,
      [hash],
    );

    console.log("Administrateur créé.");
    console.log("Email : email@gmail.com");
    console.log("Mot de passe : Admin123!");
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

seedAdmin();
