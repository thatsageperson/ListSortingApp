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

    // #region agent log
    let purpose;
    try {
      const body = await request.json();
      purpose = body?.purpose;
      fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analyze-purpose/route.js:body',message:'request body',data:{hasPurpose:!!purpose},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    } catch (e) {
      fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analyze-purpose/route.js:request.json',message:'request.json threw',data:{err:String(e?.message)},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
      throw e;
    }
    // #endregion

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
    // #region agent log
    const hasChoices = Array.isArray(aiData?.choices) && aiData.choices.length > 0;
    const content = hasChoices ? aiData.choices[0]?.message?.content : undefined;
    fetch('http://127.0.0.1:7242/ingest/03154c9a-7d27-48e7-ae59-993be66d0c71',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analyze-purpose/route.js:after openai',message:'openai response',data:{ok:aiResponse.ok,status:aiResponse.status,hasChoices,hasContent:!!content},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    if (!hasChoices || !content) {
      return Response.json({ error: "Failed to analyze purpose" }, { status: 502 });
    }
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      return Response.json({ error: "Failed to analyze purpose" }, { status: 500 });
    }
    return Response.json(parsed);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to analyze purpose" },
      { status: 500 },
    );
  }
}
