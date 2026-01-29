import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    // TEMPORARILY DISABLED FOR TESTING
    /*
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    */

    const userId = session?.user?.id || "test-user";

    const { input } = await request.json();
    if (!input) {
      return Response.json({ error: "Input is required" }, { status: 400 });
    }

    // 1. Fetch user's lists
    const lists = await sql`
      SELECT id, name, rules 
      FROM lists 
      WHERE user_id = ${userId}
    `;

    if (lists.length === 0) {
      return Response.json({
        message: "No lists found. Please create a list first.",
      });
    }

    // 2. Call AI to categorize items and detect if they're logs or tasks
    const prompt = `
      You are an organizational assistant. The user provided this text: "${input}"
      
      Here are the available lists and their rules:
      ${lists.map((l) => `- List ID: ${l.id}, Name: ${l.name}, Rules: ${l.rules}`).join("\n")}
      
      Your task:
      1. Break down the user input into individual items.
      2. For each item, decide which list it belongs to based on the rules and list names.
      3. Detect if this is a LOG ENTRY (past event that happened, e.g. "I walked the dog", "took a shit", "went to gym") or a TASK (future todo, e.g. "walk the dog", "need to shit", "go to gym").
      4. For LOG ENTRIES: set completed to true, convert to present tense or simple past (e.g. "walked the dog" or "dog walk"), and the system will add a timestamp
      5. For TASKS: set completed to false, keep as future action
      6. Detect priority: "low", "medium", "high", or null if not applicable
      7. If an item doesn't fit any list, set listId to null
      
      Examples:
      - "I walked the dog" → Log entry, completed: true, content: "Dog walk"
      - "Walk the dog" → Task, completed: false, content: "Walk the dog"
      - "I took a shit" → Log entry, completed: true, content: "Shit"
      - "Need to take a shit" → Task, completed: false, content: "Take a shit"
      
      Respond with ONLY a JSON object containing an 'items' array.
    `;

    const aiResponse = await fetch(
      `${process.env.APP_URL}/integrations/chat-gpt/conversationgpt4`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are an AI that organizes text into lists and distinguishes between past events (logs) and future tasks.",
            },
            { role: "user", content: prompt },
          ],
          json_schema: {
            name: "categorized_items",
            schema: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      content: { type: "string" },
                      listId: { type: ["integer", "null"] },
                      priority: { type: ["string", "null"] },
                      completed: { type: "boolean" },
                    },
                    required: ["content", "listId", "priority", "completed"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["items"],
              additionalProperties: false,
            },
            strict: true,
          },
        }),
      },
    );

    const aiData = await aiResponse.json();
    const result = JSON.parse(aiData.choices[0].message.content);

    // 3. Insert items into the database
    const createdItems = [];
    for (const item of result.items) {
      if (item.listId) {
        const [inserted] = await sql`
          INSERT INTO list_items (list_id, content, priority, completed)
          VALUES (${item.listId}, ${item.content}, ${item.priority || null}, ${item.completed})
          RETURNING *
        `;
        createdItems.push({
          ...inserted,
          listName: lists.find((l) => l.id === item.listId)?.name,
        });
      }
    }

    return Response.json({ success: true, items: createdItems });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to process input" }, { status: 500 });
  }
}
