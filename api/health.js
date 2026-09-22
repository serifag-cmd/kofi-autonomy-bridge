export default function handler(req, res) {
  res.status(200).json({ ok: true, service: "kofi-autonomy-bridge", version: "0.1.0" });
}
