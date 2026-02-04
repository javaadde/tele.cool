"use client";

import { useMemo, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";
import { User, Settings, Download, MessageSquare, Plus } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

export const Sidebar = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const { accounts, activeAccountId, setActiveAccount, setRevealTriggered, renameAccount } =
    useChatStore();
  const router = useRouter();
  const pathname = usePathname();
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(
    null
  );

  const accountsWithActive = useMemo(
    () =>
      accounts.map((acc) => ({
        ...acc,
        isActive: acc.id === activeAccountId,
      })),
    [accounts, activeAccountId]
  );

  const handleRename = (id: string, currentName: string) => {
    const next = window.prompt("Rename account", currentName);
    if (!next) return;
    renameAccount(id, next.trim());
  };

  return (
    <div className="w-16 h-full bg-tg-sidebar border-r border-tg-border flex flex-col items-center py-4 gap-4">
      {/* Account Avatars */}
      {accountsWithActive.map((acc) => (
        <button
          key={acc.id}
          onClick={() => setActiveAccount(acc.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ id: acc.id, x: e.clientX, y: e.clientY });
          }}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative group",
            activeAccountId === acc.id 
              ? "bg-tg-blue text-white rounded-2xl" 
              : "bg-tg-chat-bg text-tg-text-secondary hover:bg-tg-blue hover:text-white"
          )}
        >
          <User size={24} />
          {activeAccountId === acc.id && (
            <motion.div 
              layoutId="active-account"
              className="absolute -right-1 w-1 h-8 bg-tg-blue rounded-l-full"
            />
          )}
          
          <div className="absolute left-16 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
            {acc.name}
          </div>
        </button>
      ))}

      <button
        onClick={() => router.push("/login")}
        className="w-12 h-12 rounded-xl border border-dashed border-tg-text-secondary/30 flex items-center justify-center text-tg-text-secondary hover:border-tg-blue hover:text-tg-blue transition-colors"
      >
        <Plus size={24} />
      </button>

      <div className="mt-auto flex flex-col gap-4 items-center">
        {/* MESSAGES BUTTON - Primary trigger for hidden chats on double click */}
        <button 
          onClick={() => router.push("/")}
          onDoubleClick={() => setRevealTriggered(true)}
          className={cn(
            "p-3 rounded-xl transition-all",
            pathname === "/" ? "bg-tg-blue text-white" : "text-tg-text-secondary hover:bg-tg-blue/10 hover:text-tg-blue"
          )}
        >
          <MessageSquare size={22} />
        </button>

        <button 
          onClick={() => router.push("/downloads")}
          className={cn(
            "p-3 rounded-xl transition-all",
            pathname === "/downloads" ? "bg-tg-blue text-white" : "text-tg-text-secondary hover:bg-tg-blue/10 hover:text-tg-blue"
          )}
        >
          <Download size={22} />
        </button>
        
        <button 
          onClick={onOpenSettings}
          className="p-3 text-tg-text-secondary hover:bg-tg-blue/10 hover:text-tg-blue transition-all rounded-xl"
        >
          <Settings size={22} />
        </button>
      </div>

      {contextMenu && (
        <button
          onClick={() => setContextMenu(null)}
          className="fixed inset-0 z-40"
          aria-label="Close account menu"
        />
      )}

      {contextMenu && (
        <div
          className="fixed z-50 bg-tg-sidebar border border-tg-border rounded-xl shadow-xl text-sm overflow-hidden"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            className="px-3 py-2 text-left w-full hover:bg-tg-blue/10"
            onClick={() => {
              const account = accounts.find((acc) => acc.id === contextMenu.id);
              if (account) handleRename(account.id, account.name);
              setContextMenu(null);
            }}
          >
            Rename
          </button>
        </div>
      )}
    </div>
  );
};
