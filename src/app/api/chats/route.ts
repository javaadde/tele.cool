import { NextRequest, NextResponse } from "next/server";
import { getTgClientWithSession } from "@/lib/server/telegramManager";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { session, limit = 100 } = await req.json();
    if (!session) {
      console.error("Chats API: Missing session");
      return NextResponse.json({ error: "Session is required" }, { status: 400 });
    }

    console.log("Chats API: Fetching for session...", session.substring(0, 10) + "...");
    const client = await getTgClientWithSession(session);
    
    // Ensure client is connected
    if (!client.connected) {
      console.log("Chats API: Client not connected, connecting...");
      await client.connect();
    }

    const isAuthorized = await client.isUserAuthorized();
    console.log("Chats API: isAuthorized?", isAuthorized);
    
    if (!isAuthorized) {
      return NextResponse.json({ error: "Session is not authorized" }, { status: 401 });
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 200);
    console.log(`Chats API: Getting dialogs (limit: ${safeLimit})...`);
    
    const dialogs = await client.getDialogs({ limit: safeLimit });
    console.log(`Chats API: Found ${dialogs.length} dialogs`);

    const chats = dialogs.map((dialog: any) => {
      // In GramJS, dialog.id can be a BigInteger
      const id = dialog.id?.toString() || dialog.entity?.id?.toString() || Math.random().toString();
      const name = dialog.name || dialog.title || "Unknown Chat";
      const lastMessage = dialog.message?.message || "";
      const timestamp = dialog.message?.date || dialog.date || 0;
      
      return {
        id,
        name,
        lastMessage,
        timestamp,
        unreadCount: dialog.unreadCount || 0,
        isHidden: false,
        avatar: `/api/avatar?peerId=${id}&session=${encodeURIComponent(session)}`,
      };
    });

    return NextResponse.json({ chats });
  } catch (error: any) {
    console.error("Telegram Chats Error:", error);
    return NextResponse.json({ 
      error: error.message || "Internal Server Error",
      details: error.stack
    }, { status: 500 });
  }
}
