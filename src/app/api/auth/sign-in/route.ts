import { NextRequest, NextResponse } from "next/server";
import { getTgClient } from "@/lib/server/telegramManager";
import { Api } from "telegram";

export async function POST(req: NextRequest) {
  try {
    const { phone, code, phoneCodeHash } = await req.json();
    
    if (!phone || !code || !phoneCodeHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await getTgClient(phone);
    
    const result: any = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phone,
        phoneCodeHash: phoneCodeHash,
        phoneCode: code,
      })
    );

    // Save session string if needed
    const session = client.session.save() as unknown as string;

    return NextResponse.json({ 
      user: {
        id: result.user.id.toString(),
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        username: result.user.username,
        phone: phone
      },
      session: session
    });
  } catch (error: any) {
    console.error("Telegram SignIn Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
