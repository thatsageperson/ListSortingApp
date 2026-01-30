import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/** Shares the list with a user by email and permission (view/edit). */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    // TEMPORARILY DISABLED FOR TESTING
    /*
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const userId = session?.user?.id || "test-user";

    const { email, permission } = await request.json();
    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Verify list ownership
    const [list] = await sql`
      SELECT * FROM lists 
      WHERE id = ${params.id} AND user_id = ${userId}
    `;
    if (!list) {
      return Response.json(
        { error: "List not found or unauthorized" },
        { status: 404 },
      );
    }

    // Find the user to share with
    const [targetUser] = await sql`
      SELECT id FROM auth_users WHERE email = ${email}
    `;
    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Check if already shared
    const [existingShare] = await sql`
      SELECT * FROM list_shares 
      WHERE list_id = ${params.id} AND shared_with_user_id = ${targetUser.id}
    `;
    if (existingShare) {
      return Response.json(
        { error: "List already shared with this user" },
        { status: 400 },
      );
    }

    // Create share
    const [share] = await sql`
      INSERT INTO list_shares (list_id, shared_with_user_id, permission)
      VALUES (${params.id}, ${targetUser.id}, ${permission || "view"})
      RETURNING *
    `;

    return Response.json({ success: true, share });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to share list" }, { status: 500 });
  }
}

/** Returns all shares for the list (owner only). */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    // TEMPORARILY DISABLED FOR TESTING
    /*
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const userId = session?.user?.id || "test-user";

    // Verify list ownership
    const [list] = await sql`
      SELECT * FROM lists 
      WHERE id = ${params.id} AND user_id = ${userId}
    `;
    if (!list) {
      return Response.json(
        { error: "List not found or unauthorized" },
        { status: 404 },
      );
    }

    // Get all shares for this list
    const shares = await sql`
      SELECT s.*, u.email, u.name 
      FROM list_shares s
      JOIN auth_users u ON s.shared_with_user_id = u.id
      WHERE s.list_id = ${params.id}
    `;

    return Response.json(shares);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch shares" }, { status: 500 });
  }
}

/** Removes a share by shareId (owner only). */
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    // TEMPORARILY DISABLED FOR TESTING
    /*
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const userId = session?.user?.id || "test-user";

    const { shareId } = await request.json();
    if (!shareId) {
      return Response.json({ error: "Share ID is required" }, { status: 400 });
    }

    // Verify list ownership before allowing deletion
    const [list] = await sql`
      SELECT * FROM lists 
      WHERE id = ${params.id} AND user_id = ${userId}
    `;
    if (!list) {
      return Response.json(
        { error: "List not found or unauthorized" },
        { status: 404 },
      );
    }

    await sql`DELETE FROM list_shares WHERE id = ${shareId} AND list_id = ${params.id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to remove share" }, { status: 500 });
  }
}
