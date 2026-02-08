import { NextRequest, NextResponse } from "next/server";
import { getTgClientWithSession } from "@/lib/server/telegramManager";
import { Api } from "telegram";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";

const logFile = path.join(process.cwd(), 'download_debug.log');
const log = (msg: string) => {
    const entry = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(logFile, entry);
    console.log(msg);
};

export async function POST(req: NextRequest) {
  try {
    const { session, messageId, chatId, targetPath, fileName } = await req.json();

    log(`API Called: ${messageId} in ${chatId}`);

    if (!session || !messageId || !chatId) {
      log("Error: Missing fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await getTgClientWithSession(session);
    
    // Resolve target path
    let finalPath = targetPath ? targetPath.replace(/^~\//, os.homedir() + '/') : path.join(os.homedir(), 'Downloads', 'TeleCool');
    
    // Ensure directory exists
    if (!fs.existsSync(finalPath)) {
      log(`Creating directory: ${finalPath}`);
      fs.mkdirSync(finalPath, { recursive: true });
    }

    const fullFilePath = path.join(finalPath, fileName || `file_${messageId}`);
    
    log(`\n--- STARTING REAL DOWNLOAD ---`);
    log(`Target: ${fullFilePath}`);

    // Parse chatId to BigInt if it's a numeric string
    const parsedChatId = /^-?\d+$/.test(String(chatId)) ? BigInt(String(chatId)) : chatId;

    log(`Fetching message...`);
    let peer;
    try {
        peer = await client.getEntity(parsedChatId);
    } catch (e) {
        log(`getEntity failed, using raw chatId: ${parsedChatId}`);
        peer = parsedChatId;
    }

    const messages = await client.getMessages(peer, { ids: [parseInt(messageId)] });
    
    if (!messages || messages.length === 0) {
        log(`Error: Message ${messageId} not found`);
        return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const message = messages[0];
    if (!message.media) {
        log(`Error: Message contains no media`);
        return NextResponse.json({ error: "Message has no media" }, { status: 400 });
    }

    log(`Media Type: ${message.media.constructor.name}`);
    log(`Downloading ${fileName || 'unnamed'}...`);
    
    // GramJS high-level download with part handling
    await client.downloadMedia(message.media, {
        outputFile: fullFilePath,
        workers: 1, // Set to 1 for maximum stability if high thread counts are causing issues
        progressCallback: (progress: any) => {
            const percent = typeof progress === 'number' ? progress * 100 : 0;
            if (Math.round(percent) % 5 === 0) {
                log(`Real Storage Sync [${messageId}]: ${percent.toFixed(1)}%`);
            }
        }
    });

    if (fs.existsSync(fullFilePath)) {
        const stats = fs.statSync(fullFilePath);
        log(`Success! Final file size: ${stats.size} bytes`);
        log(`--- DOWNLOAD COMPLETE ---\n`);
        return NextResponse.json({ success: true, path: fullFilePath, size: stats.size });
    } else {
        log(`Error: File missing after download process`);
        return NextResponse.json({ error: "File not saved" }, { status: 500 });
    }

  } catch (err: any) {
    log(`CRITICAL Error: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
