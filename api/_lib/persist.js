export async function persistEvent(event, source = "metrics") {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { configured: false, persisted: false };

  try {
    const response = await fetch(
      url.replace(/\/$/, "") + "/rest/v1/everest_events",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: "return=minimal"
        },
        body: JSON.stringify({
          ...event,
          source
        })
      }
    );

    return { configured: true, persisted: response.ok };
  } catch {
    return { configured: true, persisted: false };
  }
}
