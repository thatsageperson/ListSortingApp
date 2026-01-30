import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/** Returns all lists owned by the user and lists shared with them. */
export async function GET() {
  try {
    const session = await auth();
    // TEMPORARILY DISABLED FOR TESTING
    /*
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    // Use a test user ID when auth is disabled
    const userId = session?.user?.id || "test-user";

    // Get lists owned by the user
    const ownedLists = await sql`
      SELECT *, 'owner' as role FROM lists 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;

    // Get lists shared with the user
    const sharedLists = await sql`
      SELECT l.*, s.permission as role 
      FROM lists l
      JOIN list_shares s ON l.id = s.list_id
      WHERE s.shared_with_user_id = ${userId}
      ORDER BY l.created_at DESC
    `;

    // Combine and return both
    const allLists = [...ownedLists, ...sharedLists];
    return Response.json(allLists);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch lists" }, { status: 500 });
  }
}

/** Creates a new list for the current user with name, optional description, and rules. */
export async function POST(request) {
  try {
    const session = await auth();
    // TEMPORARILY DISABLED FOR TESTING
    /*
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    // Use a test user ID when auth is disabled
    const userId = session?.user?.id || "test-user";

    const { name, description, rules } = await request.json();
    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }
    const [newList] = await sql`
      INSERT INTO lists (name, description, rules, user_id)
      VALUES (${name}, ${description || null}, ${rules || null}, ${userId})
      RETURNING *
    `;
    return Response.json(newList);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create list" }, { status: 500 });
  }
}
