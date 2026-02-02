import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

// Use global to persist across hot-reloads in development
declare global {
  var tgClients: Map<string, TelegramClient>;
}

if (!global.tgClients) {
  global.tgClients = new Map();
}

const apiId = parseInt(process.env.NEXT_PUBLIC_TELEGRAM_API_ID || "0");
const apiHash = process.env.NEXT_PUBLIC_TELEGRAM_API_HASH || "";

export async function getTgClient(phone: string) {
  if (!apiId || !apiHash) {
    throw new Error("Missing Telegram API_ID or API_HASH in .env.local");
  }

  let client = global.tgClients.get(phone);
  
  if (!client) {
    client = new TelegramClient(new StringSession(""), apiId, apiHash, {
      connectionRetries: 5,
    });
    await client.connect();
    global.tgClients.set(phone, client);
  }
  
  return client;
}
