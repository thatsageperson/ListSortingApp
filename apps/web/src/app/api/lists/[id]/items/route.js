import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

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

    // Verify list ownership or sharing
    const [list] = await sql`
      SELECT * FROM lists 
      WHERE id = ${params.id} AND (
        user_id = ${userId} OR
        id IN (SELECT list_id FROM list_shares WHERE shared_with_user_id = ${userId})
      )
    `;
    if (!list) {
      return Response.json({ error: "List not found" }, { status: 404 });
    }

    const items =
      await sql`SELECT * FROM list_items WHERE list_id = ${params.id} ORDER BY created_at DESC`;
    return Response.json(items);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

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

    // Verify list ownership or edit permission
    const [list] = await sql`
      SELECT l.*, COALESCE(s.permission, 'owner') as permission
      FROM lists l
      LEFT JOIN list_shares s ON l.id = s.list_id AND s.shared_with_user_id = ${userId}
      WHERE l.id = ${params.id} AND (
        l.user_id = ${userId} OR
        s.permission = 'edit'
      )
    `;
    if (!list) {
      return Response.json(
        { error: "List not found or insufficient permissions" },
        { status: 404 },
      );
    }

    const { content, priority } = await request.json();
    if (!content) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }
    const [newItem] = await sql`
      INSERT INTO list_items (list_id, content, priority, completed)
      VALUES (${params.id}, ${content}, ${priority || null}, false)
      RETURNING *
    `;
    return Response.json(newItem);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to add item" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    // TEMPORARILY DISABLED FOR TESTING
    /*
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const userId = session?.user?.id || "test-user";

    // Verify list ownership or edit permission
    const [list] = await sql`
      SELECT l.*, COALESCE(s.permission, 'owner') as permission
      FROM lists l
      LEFT JOIN list_shares s ON l.id = s.list_id AND s.shared_with_user_id = ${userId}
      WHERE l.id = ${params.id} AND (
        l.user_id = ${userId} OR
        s.permission = 'edit'
      )
    `;
    if (!list) {
      return Response.json(
        { error: "List not found or insufficient permissions" },
        { status: 404 },
      );
    }

    const { itemId, completed, priority, content } = await request.json();
    if (!itemId) {
      return Response.json({ error: "Item ID is required" }, { status: 400 });
    }

    const setClauses = [];
    const values = [];
    let paramCount = 1;

    if (typeof completed === "boolean") {
      setClauses.push(`completed = $${paramCount++}`);
      values.push(completed);
    }
    if (priority !== undefined) {
      setClauses.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (content !== undefined) {
      setClauses.push(`content = $${paramCount++}`);
      values.push(content);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const query = `UPDATE list_items SET ${setClauses.join(", ")} WHERE id = $${paramCount} AND list_id = $${paramCount + 1} RETURNING *`;
    const result = await sql(query, [...values, itemId, params.id]);

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update item" }, { status: 500 });
  }
}

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

    // Verify list ownership or edit permission
    const [list] = await sql`
      SELECT l.*, COALESCE(s.permission, 'owner') as permission
      FROM lists l
      LEFT JOIN list_shares s ON l.id = s.list_id AND s.shared_with_user_id = ${userId}
      WHERE l.id = ${params.id} AND (
        l.user_id = ${userId} OR
        s.permission = 'edit'
      )
    `;
    if (!list) {
      return Response.json(
        { error: "List not found or insufficient permissions" },
        { status: 404 },
      );
    }

    const { itemId } = await request.json();
    if (itemId) {
      await sql`DELETE FROM list_items WHERE id = ${itemId} AND list_id = ${params.id}`;
    } else {
      await sql`DELETE FROM list_items WHERE list_id = ${params.id}`;
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to delete item(s)" },
      { status: 500 },
    );
  }
}
