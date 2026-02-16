import { auth } from "@/auth";

/** Accepts an audio file upload and transcribes it using OpenAI Whisper. */
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Forward to OpenAI Whisper API
    const whisperForm = new FormData();
    whisperForm.append("file", audioFile);
    whisperForm.append("model", "whisper-1");
    whisperForm.append("response_format", "json");

    const whisperRes = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: whisperForm,
      },
    );

    if (!whisperRes.ok) {
      const errorData = await whisperRes.json().catch(() => ({}));
      console.error("Whisper API error:", whisperRes.status, errorData);
      return Response.json(
        { error: "Transcription failed" },
        { status: 502 },
      );
    }

    const whisperData = await whisperRes.json();
    return Response.json({ text: whisperData.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return Response.json(
      { error: "Failed to transcribe audio" },
      { status: 500 },
    );
  }
}
