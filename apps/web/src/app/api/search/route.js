import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/**
 * Searches across lists and list items accessible to the current user
 * using PostgreSQL full-text search.
 *
 * Query params:
 *   q     - search query string (required, 2-100 chars)
 *   limit - max results (default 50, max 100)
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1),
      100
    );

    if (query.length < 2) {
      return Response.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      );
    }
    if (query.length > 100) {
      return Response.json(
        { error: "Search query must be at most 100 characters" },
        { status: 400 }
      );
    }

    // Sanitize: strip special chars, split words, append :* for prefix matching
    const sanitized = query
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word + ":*")
      .join(" & ");

    if (!sanitized) {
      return Response.json({ results: [], total: 0, hasMore: false });
    }

    // Search lists accessible to user
    const listResults = await sql`
      SELECT
        l.id AS list_id,
        l.name AS list_name,
        'list' AS result_type,
        NULL::integer AS item_id,
        ts_headline('english', COALESCE(l.name, ''), to_tsquery('english', ${sanitized}),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=20, MinWords=10') AS headline,
        ts_headline('english', COALESCE(l.description, ''), to_tsquery('english', ${sanitized}),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=20, MinWords=10') AS description_headline,
        l.name AS content,
        l.description AS notes,
        NULL::boolean AS completed,
        NULL::text AS priority,
        l.created_at,
        ts_rank(l.search_vector, to_tsquery('english', ${sanitized})) AS rank
      FROM lists l
      LEFT JOIN list_shares s ON l.id = s.list_id AND s.shared_with_user_id = ${userId}
      WHERE (l.user_id = ${userId} OR s.shared_with_user_id IS NOT NULL)
        AND l.search_vector @@ to_tsquery('english', ${sanitized})
      ORDER BY rank DESC
      LIMIT ${limit}
    `;

    // Search list items in accessible lists
    const itemResults = await sql`
      SELECT
        l.id AS list_id,
        l.name AS list_name,
        'item' AS result_type,
        li.id AS item_id,
        ts_headline('english', COALESCE(li.content, ''), to_tsquery('english', ${sanitized}),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=20, MinWords=10') AS headline,
        ts_headline('english', COALESCE(li.notes, ''), to_tsquery('english', ${sanitized}),
          'StartSel=<mark>, StopSel=</mark>, MaxWords=20, MinWords=10') AS description_headline,
        li.content,
        li.notes,
        li.completed,
        li.priority,
        li.created_at,
        ts_rank(li.search_vector, to_tsquery('english', ${sanitized})) AS rank
      FROM list_items li
      JOIN lists l ON li.list_id = l.id
      LEFT JOIN list_shares s ON l.id = s.list_id AND s.shared_with_user_id = ${userId}
      WHERE (l.user_id = ${userId} OR s.shared_with_user_id IS NOT NULL)
        AND li.search_vector @@ to_tsquery('english', ${sanitized})
      ORDER BY rank DESC
      LIMIT ${limit}
    `;

    // Merge and sort by rank, cap at limit
    const allResults = [...listResults, ...itemResults]
      .sort((a, b) => b.rank - a.rank);

    const total = allResults.length;
    const capped = allResults.slice(0, limit);

    return Response.json({
      results: capped,
      total,
      hasMore: total > limit,
    });
  } catch (error) {
    console.error("Search error:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
