"use client";

export class TelegramService {
  private phone: string = "";
  private phoneCodeHash: string = "";

  async sendCode(phone: string) {
    this.phone = phone;
    
    const response = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to send code");
    }

    this.phoneCodeHash = data.phoneCodeHash;
    return data;
  }

  async signIn(code: string) {
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        phone: this.phone, 
        code: code,
        phoneCodeHash: this.phoneCodeHash
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Success! Store user in Zustand if not already handled
    return data;
  }
}

export const tgService = new TelegramService();
