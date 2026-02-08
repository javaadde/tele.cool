import { NextRequest, NextResponse } from "next/server";
import { getTgClientWithSession } from "@/lib/server/telegramManager";
import { Api } from "telegram";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { session, chatId, limit = 50 } = await req.json();
    if (!session) {
      return NextResponse.json({ error: "Session is required" }, { status: 400 });
    }
    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 });
    }

    const client = await getTgClientWithSession(session);
    
    if (!client.connected) {
      await client.connect();
    }

    // Convert chatId to appropriate peer
    let peer: any = chatId;
    if (typeof chatId === "string" && /^-?\d+$/.test(chatId)) {
      peer = BigInt(chatId);
    }

    const result = await client.getMessages(peer, {
      limit: Math.min(limit, 100),
    });

    const messages = result.map((msg: any) => ({
      id: msg.id.toString(),
      senderId: msg.fromId?.toString() || msg.peerId?.toString() || "",
      text: msg.message || "",
      timestamp: msg.date,
      isOutgoing: msg.out,
      // Handle media if needed
      hasMedia: !!msg.media,
      mediaType: msg.media ? msg.media.className : null,
      fileName: msg.media?.document?.attributes?.find((a: any) => a.fileName)?.fileName || null,
      fileSize: msg.media?.document?.size || null,
    }));

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Telegram Messages Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error"
    }, { status: 500 });
  }
}
