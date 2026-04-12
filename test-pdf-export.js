export async function getAvatars() {
  const res = await fetch(
    "https://eastus2.tts.speech.microsoft.com/cognitiveservices/avatar/list",
    {
      headers: {
        "Ocp-Apim-Subscription-Key": A16bzE3wct1ADlSjlQLhzzLl70jZfn5icliacJAzyllEZSjvZQJFJQQJ99CDACHYHv6XJ3w3AAAYACOGTj2E,
      },
    }
  );

  const data = await res.json();

  return data.value.map((a: any) => ({
    id: a.character,
    name: a.character,
    character: a.character,
    style: a.styles?.[0],
  }));
}