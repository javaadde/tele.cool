import { NextRequest, NextResponse } from "next/server";
import { getTgClient } from "@/lib/server/telegramManager";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();
    
    if (!phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await getTgClient(phone);
    
    // GramJS high-level signIn handles password correctly if already partially authenticated
    // We cast to any because the TypeScript types for GramJS can sometimes be tricky with high-level methods
    const result: any = await (client as any).signIn({
        phoneNumber: phone,
        password: async () => password,
        onError: (err: any) => {
            console.error("SignIn Password Error callback:", err);
            return true;
        }
    });

    const session = client.session.save() as unknown as string;

    return NextResponse.json({ 
      user: {
        id: result.id?.toString() || result.user?.id?.toString() || "",
        firstName: result.firstName || result.user?.firstName || "",
        lastName: result.lastName || result.user?.lastName || "",
        username: result.username || result.user?.username || "",
        phone: phone
      },
      session: session
    });
  } catch (error: any) {
    console.error("Telegram CheckPassword Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
