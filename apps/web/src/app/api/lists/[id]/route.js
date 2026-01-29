import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

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

    await sql`DELETE FROM lists WHERE id = ${params.id} AND user_id = ${userId}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete list" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    // TEMPORARILY DISABLED FOR TESTING
    /*
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const userId = session?.user?.id || "test-user";

    const { name, description, rules } = await request.json();
    const [updated] = await sql`
      UPDATE lists 
      SET name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          rules = COALESCE(${rules}, rules)
      WHERE id = ${params.id} AND user_id = ${userId}
      RETURNING *
    `;
    return Response.json(updated);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update list" }, { status: 500 });
  }
}
