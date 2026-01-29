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

    const { purpose } = await request.json();

    const prompt = `
      The user wants to create a new list with this purpose: "${purpose}"
      
      Analyze this purpose and extract:
      1. A set of "AI rules" or key phrases that define what should go into this list.
      2. A concise description of the list.
      
      Respond with ONLY a JSON object.
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
              content: "You are an AI that helps users define list rules.",
            },
            { role: "user", content: prompt },
          ],
          json_schema: {
            name: "list_analysis",
            schema: {
              type: "object",
              properties: {
                rules: { type: "string" },
                description: { type: "string" },
              },
              required: ["rules", "description"],
              additionalProperties: false,
            },
            strict: true,
          },
        }),
      },
    );

    const aiData = await aiResponse.json();
    return Response.json(JSON.parse(aiData.choices[0].message.content));
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to analyze purpose" },
      { status: 500 },
    );
  }
}
