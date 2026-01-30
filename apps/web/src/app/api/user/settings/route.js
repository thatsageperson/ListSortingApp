import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

const ensureTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      settings JSONB NOT NULL DEFAULT '{}',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
};

let tableReady = false;

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id || "test-user";

    if (!tableReady) {
      await ensureTable();
      tableReady = true;
    }

    const rows = await sql`
      SELECT settings FROM user_settings WHERE user_id = ${userId}
    `;

    return Response.json(rows.length > 0 ? rows[0].settings : {});
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "test-user";

    if (!tableReady) {
      await ensureTable();
      tableReady = true;
    }

    const body = await request.json();
    // Support { key, value } for single setting or full object replacement
    let newSettings;
    if (body.key !== undefined) {
      const rows = await sql`
        SELECT settings FROM user_settings WHERE user_id = ${userId}
      `;
      const current = rows.length > 0 ? rows[0].settings : {};
      current[body.key] = body.value;
      newSettings = current;
    } else {
      newSettings = body;
    }

    await sql`
      INSERT INTO user_settings (user_id, settings, updated_at)
      VALUES (${userId}, ${JSON.stringify(newSettings)}, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET settings = ${JSON.stringify(newSettings)}, updated_at = NOW()
    `;

    return Response.json(newSettings);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
