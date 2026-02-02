import { NextRequest, NextResponse } from "next/server";
import { getTgClient } from "@/lib/server/telegramManager";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });

    const client = await getTgClient(phone);
    
    const apiId = parseInt(process.env.NEXT_PUBLIC_TELEGRAM_API_ID || "0");
    const apiHash = process.env.NEXT_PUBLIC_TELEGRAM_API_HASH || "";

    const result = await client.sendCode(
      {
        apiId,
        apiHash,
      },
      phone
    );

    return NextResponse.json({ 
      phoneCodeHash: result.phoneCodeHash,
      // @ts-ignore
      isCodeViaApp: result.type === "app" 
    });
  } catch (error: any) {
    console.error("Telegram SendCode Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
