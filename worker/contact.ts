export interface ContactEnv {
  WEB3FORMS_ACCESS_KEY: string;
}

type FieldName = "name" | "email" | "type" | "date" | "guests";

const PROGRAM_LABELS: Record<string, string> = {
  tisch: "Magie am Tisch",
  kindershow: "Kindershow",
  beides: "Beides",
};

function emailLooksValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(body: Record<string, unknown>) {
  const errors: Partial<Record<FieldName, string>> = {};

  const name = String(body.name ?? "").trim();
  if (!name) errors.name = "Bitte gib deinen Namen an.";

  const email = String(body.email ?? "").trim();
  if (!email) errors.email = "Bitte gib deine E-Mail-Adresse an.";
  else if (!emailLooksValid(email))
    errors.email = "Diese E-Mail-Adresse sieht unvollständig aus.";

  const type = String(body.type ?? "");
  if (!type || !PROGRAM_LABELS[type]) errors.type = "Bitte wähle ein Programm.";

  const date = String(body.date ?? "");
  if (!date || Number.isNaN(Date.parse(date)))
    errors.date = "Bitte wähle ein Datum.";

  const guestsNum = Number(body.guests);
  if (!body.guests || !Number.isFinite(guestsNum) || guestsNum < 1)
    errors.guests = "Bitte gib die Anzahl Gäste an.";

  return errors;
}

export async function handleContact(request: Request, env: ContactEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const errors = validate(body);
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 400 });
  }

  const name = String(body.name).trim();
  const email = String(body.email).trim();
  const type = String(body.type);
  const date = String(body.date);
  const guests = String(body.guests);

  if (!env.WEB3FORMS_ACCESS_KEY) {
    return Response.json({ ok: false, error: "not_configured" }, { status: 500 });
  }

  const web3formsRes = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: env.WEB3FORMS_ACCESS_KEY,
      subject: `Neue Anfrage von ${name} — ${date}`,
      from_name: name,
      name,
      email,
      Programm: PROGRAM_LABELS[type] ?? type,
      Datum: date,
      Gäste: guests,
    }),
  });

  const result = (await web3formsRes.json().catch(() => null)) as { success?: boolean } | null;

  if (!web3formsRes.ok || !result?.success) {
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
