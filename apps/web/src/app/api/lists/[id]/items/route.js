import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/** Returns all items for the list if the user owns it or has access via sharing. */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

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
      await sql`SELECT * FROM list_items WHERE list_id = ${params.id} ORDER BY is_pinned DESC NULLS LAST, pinned_at DESC NULLS LAST, created_at DESC`;
    return Response.json(items);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

/** Adds a new item (content, optional priority) to the list for owner or edit permission. */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

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

    const { content, priority, notes, rich_content, display_mode, type } = await request.json();
    if (!content) {
      return Response.json({ error: "Content is required" }, { status: 400 });
    }
    const [newItem] = await sql`
      INSERT INTO list_items (list_id, content, priority, completed, notes, rich_content, display_mode, type)
      VALUES (${params.id}, ${content}, ${priority || null}, false, ${notes || null}, ${rich_content ? JSON.stringify(rich_content) : null}::jsonb, ${display_mode || 'todo-strike'}, ${type || 'task'})
      RETURNING *
    `;
    return Response.json(newItem);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to add item" }, { status: 500 });
  }
}

/** Updates an item (completed, priority, or content) for owner or edit permission. */
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

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

    const { itemId, completed, priority, content, notes, display_mode, rich_content, is_pinned } = await request.json();
    if (!itemId) {
      return Response.json({ error: "Item ID is required" }, { status: 400 });
    }

    const hasCompleted = typeof completed === "boolean";
    const hasPriority = priority !== undefined;
    const hasContent = content !== undefined;
    const hasNotes = notes !== undefined;
    const hasDisplayMode = display_mode !== undefined;
    const hasRichContent = rich_content !== undefined;
    const hasPinned = typeof is_pinned === "boolean";
    if (!hasCompleted && !hasPriority && !hasContent && !hasNotes && !hasDisplayMode && !hasRichContent && !hasPinned) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    const [current] = await sql`
      SELECT completed, priority, content, notes, display_mode, rich_content, is_pinned, pinned_at
      FROM list_items WHERE id = ${itemId} AND list_id = ${params.id}
    `;
    if (!current) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    const newCompleted = hasCompleted ? completed : current.completed;
    const newPriority = hasPriority ? priority : current.priority;
    const newContent = hasContent ? content : current.content;
    const newNotes = hasNotes ? notes : current.notes;
    const newDisplayMode = hasDisplayMode ? display_mode : current.display_mode;
    const newRichContent = hasRichContent ? (rich_content ? JSON.stringify(rich_content) : null) : (current.rich_content ? JSON.stringify(current.rich_content) : null);
    const newIsPinned = hasPinned ? is_pinned : (current.is_pinned || false);
    const newPinnedAt = hasPinned
      ? (is_pinned ? (current.is_pinned ? current.pinned_at : new Date().toISOString()) : null)
      : current.pinned_at;

    const [updated] = await sql`
      UPDATE list_items
      SET completed = ${newCompleted}, priority = ${newPriority}, content = ${newContent}, notes = ${newNotes}, display_mode = ${newDisplayMode}, rich_content = ${newRichContent}::jsonb, is_pinned = ${newIsPinned}, pinned_at = ${newPinnedAt}
      WHERE id = ${itemId} AND list_id = ${params.id}
      RETURNING *
    `;
    return Response.json(updated);
  } catch (error) {
    console.error(error);
    fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'items/route.js:PUT catch',message:'PUT handler error',data:{err:String(error?.message)},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    return Response.json({ error: "Failed to update item" }, { status: 500 });
  }
}

/** Deletes one item by itemId or all items in the list; requires owner or edit permission. */
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

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
