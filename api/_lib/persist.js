export async function persistEvent(event, source = "metrics") {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { configured: false, persisted: false, duplicateSafe: false };

  try {
    const response = await fetch(
      url.replace(/\/$/, "") + "/rest/v1/everest_events?on_conflict=id",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
          // Ko-fi retries the same MessageID when it does not receive HTTP 200.
          // Ignore duplicate primary keys: first verified payload wins.
          Prefer: "resolution=ignore-duplicates,return=minimal"
        },
        body: JSON.stringify({ ...event, source })
      }
    );

    return { configured: true, persisted: response.ok, status: response.status, duplicateSafe: true };
  } catch {
    return { configured: true, persisted: false, duplicateSafe: true };
  }
}
