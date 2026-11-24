import "dotenv/config";

export function requireApiKey(): string {
  const key = process.env.ANTHROPIC_AUTH_TOKEN;
  if (!key) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY. Copy .env.example to .env and add your key."
    );
  }
  return key;
}