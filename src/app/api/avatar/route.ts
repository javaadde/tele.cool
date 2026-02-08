import { NextRequest, NextResponse } from "next/server";
import { getTgClientWithSession } from "@/lib/server/telegramManager";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = searchParams.get("session");
    const peerId = searchParams.get("peerId");

    if (!session || !peerId) {
      return new NextResponse("Missing session or peerId", { status: 400 });
    }

    const client = await getTgClientWithSession(session);
    if (!client.connected) await client.connect();

    let peer: any = peerId;
    if (typeof peerId === "string" && /^-?\d+$/.test(peerId)) {
      peer = BigInt(peerId);
    }

    const buffer = await client.downloadProfilePhoto(peer);

    if (!buffer) {
      // Return a transparent 1x1 pixel or a placeholder
      return new NextResponse("No photo", { status: 404 });
    }

    return new NextResponse(buffer as any, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Avatar API Error:", error);
    return new NextResponse("Error fetching avatar", { status: 500 });
  }
}
