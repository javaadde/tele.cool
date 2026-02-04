import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

// Use global to persist across hot-reloads in development
declare global {
  var tgClients: Map<string, TelegramClient>;
  var tgSessionClients: Map<string, TelegramClient>;
}

if (!global.tgClients) global.tgClients = new Map();
if (!global.tgSessionClients) global.tgSessionClients = new Map();

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

export async function getTgClientWithSession(session: string) {
  if (!apiId || !apiHash) {
    throw new Error("Missing Telegram API_ID or API_HASH in .env.local");
  }
  if (!session) {
    throw new Error("Missing Telegram session string");
  }

  let client = global.tgSessionClients.get(session);

  if (!client) {
    console.log("Creating new TG client for session");
    client = new TelegramClient(new StringSession(session), apiId, apiHash, {
      connectionRetries: 5,
    });
    await client.connect();
    // Verify session
    try {
      await client.getMe();
      console.log("TG client session verified via getMe");
    } catch (e) {
      console.error("TG client session verification failed:", e);
    }
    global.tgSessionClients.set(session, client);
  } else if (!client.connected) {
    console.log("Reconnecting existing TG client");
    await client.connect();
  }

  return client;
}
