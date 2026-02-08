import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('name');
    const customPath = searchParams.get('path'); // Optional custom path

    if (!fileName) {
      return NextResponse.json({ error: "File name is required" }, { status: 400 });
    }

    // Default to our TeleCool downloads folder
    let targetDir = path.join(os.homedir(), 'Downloads', 'TeleCool');
    
    // Check for custom path if provided
    if (customPath) {
        targetDir = customPath.replace(/^~\//, os.homedir() + '/');
    }

    const filePath = path.join(targetDir, fileName);

    if (!fs.existsSync(filePath)) {
       console.error(`File not found at: ${filePath}`);
       return NextResponse.json({ error: "File not found on server" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    // Return file as a downloadable attachment
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': 'application/octet-stream',
      },
    });

  } catch (error: any) {
    console.error("File download API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
