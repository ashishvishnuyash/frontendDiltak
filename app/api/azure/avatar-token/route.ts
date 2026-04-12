import { NextResponse } from "next/server";

export async function GET() {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  if (!speechKey || !speechRegion) {
    return NextResponse.json(
      { error: "Azure Speech credentials not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch ICE relay token for WebRTC connection
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const tokenRes = await fetch(
      `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": speechKey,
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("Azure ICE token error:", tokenRes.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch ICE token" },
        { status: tokenRes.status }
      );
    }

    const iceData = await tokenRes.json();

    return NextResponse.json({
      iceServerUrl: iceData.Urls[0],
      iceServerUsername: iceData.Username,
      iceServerCredential: iceData.Password,
      speechKey,
      speechRegion,
    });
  } catch (error) {
    console.error("Azure avatar token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
