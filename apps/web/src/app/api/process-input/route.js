import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/** Parses user input with AI into items, assigns lists, and inserts items into the database. */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // #region agent log
    let body;
    try {
      body = await request.json();
    } catch (parseErr) {
      fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'process-input/route.js:request.json',message:'request.json threw',data:{err:String(parseErr?.message)},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
      throw parseErr;
    }
    const { input } = body;
    fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'process-input/route.js:after json',message:'body parsed',data:{hasInput:!!input},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
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

    const now = new Date().toISOString();

    // 2. Call AI to categorize items and detect if they're logs or tasks
    const prompt = `
      You are an organizational assistant. The current date/time is: ${now}

      The user provided this text: "${input}"

      Here are the available lists and their rules:
      ${lists.map((l) => `- List ID: ${l.id}, Name: ${l.name}, Rules: ${l.rules}`).join("\n")}

      Your task:
      1. Break down the user input into individual items.
      2. For each item, decide which list it belongs to based on the rules and list names.
      3. Detect if this is a LOG ENTRY (past event that happened, e.g. "I walked the dog at 8pm", "took a shit", "went to gym yesterday"), a TASK (future todo, e.g. "walk the dog", "need to go to gym"), or a NOTE (reference info, ideas, thoughts, recipes, meeting notes, e.g. "note: meeting at 3pm room 204", "recipe for pasta", "idea for the project").
      4. Set type to "log" for log entries, "task" for tasks, or "note" for notes.
      5. Separate the core action into "content" (short label) and any extra details into "notes". The content should be a clean, short label. The notes should capture additional context, details, or descriptions. Set notes to null if there are no extra details.
      6. For LOG ENTRIES: set completed to false. Extract any mentioned timestamp and return it as an ISO 8601 string relative to the current time. If no time is mentioned, use the current time.
      7. For TASKS: set completed to false, keep as future action, set timestamp to null.
      8. Detect priority: "low", "medium", "high", or null if not applicable.
      9. If an item doesn't fit any list, set listId to null.
      10. Detect the user's desired formatting style and set display_mode accordingly:
          - "todo-strike": Default for tasks. Also when user says "checklist", "check off", or "to-do".
          - "todo-no-strike": When user says "don't cross out" or "just a checkbox".
          - "bullet": When user says "bullet point", "list item".
          - "log-clock": Default for log entries. Also when user says "record this", "logged", or "timestamp".
          - "note": When user says "note", "jot down", "remember this", or provides reference info, ideas, recipes, meeting notes.

      Examples (assuming current time is ${now}):
      - "I walked the dog at 8am, it peed and pooped" → type: "log", content: "Dog walk", notes: "Peed and pooped", display_mode: "log-clock", timestamp: "<today at 8am ISO>"
      - "Walk the dog and make sure to bring bags" → type: "task", content: "Walk the dog", notes: "Bring bags", display_mode: "todo-strike", timestamp: null
      - "went to gym yesterday at 6am, did legs and cardio" → type: "log", content: "Gym session", notes: "Legs and cardio", display_mode: "log-clock", timestamp: "<yesterday 6am ISO>"
      - "I walked the dog at 8pm" → type: "log", content: "Dog walk", notes: null, display_mode: "log-clock", timestamp: "<today at 8pm ISO>"
      - "Add a bullet point for 'Buy milk'" → type: "task", content: "Buy milk", notes: null, display_mode: "bullet", timestamp: null
      - "Record that I finished the report at 2pm" → type: "log", content: "Finished report", notes: null, display_mode: "log-clock", timestamp: "<today at 2pm ISO>"
      - "Checklist item: Clean the kitchen" → type: "task", content: "Clean the kitchen", notes: null, display_mode: "todo-strike", timestamp: null
      - "note: meeting at 3pm, room 204" → type: "note", content: "Meeting at 3pm", notes: "Room 204", display_mode: "note", timestamp: null
      - "recipe for banana bread: 3 bananas, 1 cup sugar, butter" → type: "note", content: "Banana bread recipe", notes: "3 bananas, 1 cup sugar, butter", display_mode: "note", timestamp: null
      - "idea: build a garden planter from pallets" → type: "note", content: "Build garden planter from pallets", notes: null, display_mode: "note", timestamp: null

      Respond with ONLY a JSON object containing an 'items' array.
    `;

    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an AI that organizes text into lists and distinguishes between past events (logs) and future tasks. Detect the user's desired formatting style for each item.",
            },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "categorized_items",
              strict: true,
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
                        type: { type: "string", enum: ["task", "log", "note"] },
                        timestamp: { type: ["string", "null"] },
                        notes: { type: ["string", "null"] },
                        display_mode: { type: "string", enum: ["todo-strike", "todo-no-strike", "bullet", "log-clock", "note"] },
                      },
                      required: ["content", "listId", "priority", "completed", "type", "timestamp", "notes", "display_mode"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["items"],
                additionalProperties: false,
              },
            },
          },
        }),
      },
    );

    const aiData = await aiResponse.json();
    // #region agent log
    const hasChoices = Array.isArray(aiData?.choices) && aiData.choices.length > 0;
    const content = hasChoices ? aiData.choices[0]?.message?.content : undefined;
    fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'process-input/route.js:after openai',message:'openai response',data:{ok:aiResponse.ok,status:aiResponse.status,hasChoices,hasContent:!!content,contentLength:typeof content==='string'?content.length:0},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    if (!hasChoices || !content) {
      return Response.json({ message: "AI could not process your input. Please try again." }, { status: 502 });
    }
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseErr) {
      fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'process-input/route.js:JSON.parse',message:'parse content threw',data:{err:String(parseErr?.message)},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
      return Response.json({ error: "Failed to process input" }, { status: 500 });
    }
    if (!result || !Array.isArray(result.items)) {
      return Response.json({ error: "Failed to process input" }, { status: 500 });
    }

    // 3. Insert items into the database
    const createdItems = [];
    for (const item of result.items) {
      if (item.listId) {
        const createdAt = item.timestamp || now;
        const [inserted] = await sql`
          INSERT INTO list_items (list_id, content, priority, completed, type, created_at, notes, display_mode)
          VALUES (${item.listId}, ${item.content}, ${item.priority || null}, ${item.completed}, ${item.type}, ${createdAt}, ${item.notes || null}, ${item.display_mode || "todo-strike"})
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
