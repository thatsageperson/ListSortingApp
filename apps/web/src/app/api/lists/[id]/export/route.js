import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/** Exports the list as ics (Apple Reminders), json, or plain text based on ?format=. */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get("format") || "text";
    const includeCompleted = url.searchParams.get("includeCompleted") !== "false";

    // Verify list ownership or sharing
    const [list] = await sql`
      SELECT * FROM lists 
      WHERE id = ${params.id} AND (
        user_id = ${session.user.id} OR
        id IN (SELECT list_id FROM list_shares WHERE shared_with_user_id = ${session.user.id})
      )
    `;
    if (!list) {
      return Response.json({ error: "List not found" }, { status: 404 });
    }

    let items = await sql`
      SELECT * FROM list_items
      WHERE list_id = ${params.id}
      ORDER BY created_at DESC
    `;
    if (!includeCompleted) {
      items = items.filter((i) => !i.completed);
    }

    // Format based on type
    if (format === "ics") {
      // iCalendar format for Apple Reminders
      const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SmartLists//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:" + list.name,
        "X-WR-TIMEZONE:UTC",
        "X-APPLE-CALENDAR-COLOR:#219079",
        ...items.map((item) => {
          const uid = `smartlists-${list.id}-${item.id}@smartlists.app`;
          return [
            "BEGIN:VTODO",
            `UID:${uid}`,
            `SUMMARY:${item.content}`,
            `STATUS:${item.completed ? "COMPLETED" : "NEEDS-ACTION"}`,
            `PRIORITY:${item.priority === "high" ? "1" : item.priority === "medium" ? "5" : "9"}`,
            `DTSTAMP:${new Date(item.created_at).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
            "END:VTODO",
          ].join("\r\n");
        }),
        "END:VCALENDAR",
      ].join("\r\n");

      return new Response(icsContent, {
        headers: {
          "Content-Type": "text/calendar",
          "Content-Disposition": `attachment; filename="${list.name}.ics"`,
        },
      });
    } else if (format === "json") {
      return Response.json({ list, items });
    } else {
      // Plain text format
      const textContent = [
        list.name,
        "=".repeat(list.name.length),
        "",
        ...items.map((item) => {
          const checkbox = item.completed ? "[x]" : "[ ]";
          const priority = item.priority
            ? `[${item.priority.toUpperCase()}]`
            : "";
          return `${checkbox} ${priority} ${item.content}`.trim();
        }),
      ].join("\n");

      return new Response(textContent, {
        headers: {
          "Content-Type": "text/plain",
          "Content-Disposition": `attachment; filename="${list.name}.txt"`,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to export list" }, { status: 500 });
  }
}
