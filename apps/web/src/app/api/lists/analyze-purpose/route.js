import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

/** Calls AI to analyze a list purpose and return rules and description for the new list. */
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
              content: "You are an AI that helps users define list rules.",
            },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "list_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  rules: { type: "string" },
                  description: { type: "string" },
                },
                required: ["rules", "description"],
                additionalProperties: false,
              },
            },
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
