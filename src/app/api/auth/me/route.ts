import { NextRequest, NextResponse } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { Api } from "telegram";

const API_ID = Number(process.env.NEXT_PUBLIC_TELEGRAM_API_ID);
const API_HASH = process.env.NEXT_PUBLIC_TELEGRAM_API_HASH || "";

export async function POST(req: NextRequest) {
  try {
    const { session } = await req.json();

    if (!session) {
      return NextResponse.json({ error: "No session provided" }, { status: 400 });
    }

    const client = new TelegramClient(new StringSession(session), API_ID, API_HASH, {
      connectionRetries: 5,
    });

    await client.connect();

    const me: any = await client.getMe();

    return NextResponse.json({
      user: {
        id: me.id.toString(),
        firstName: me.firstName,
        lastName: me.lastName,
        username: me.username,
        phone: me.phone,
      },
    });
  } catch (error: any) {
    console.error("Fetch Me Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
