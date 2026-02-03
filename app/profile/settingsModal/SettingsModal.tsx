"use client";

import { useState } from "react";
import { PixelPopup } from "@/features/ui/PixelPopup";
import { PixelTabButton } from "@/features/ui/PixelTabButton";
import { AccountTab } from "../tabs/accountTab";

type TabKey = "account" | "privacy" | "terms";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabKey>("account");

  return (
    <PixelPopup
      onClose={onClose}
      header={
        <>
          <div className="pixel-text-title text-xl">SETTINGS</div>
          <div className="text-xs text-[color:var(--game-muted)]">
            Manage your account
          </div>
        </>
      }
      footer={
        <button onClick={onClose} className="pixel-btn px-6 py-2">
          Close
        </button>
      }
    >
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-56 shrink-0 border-r-4 border-[color:var(--pixel-border)] p-4 space-y-3">
          <PixelTabButton
            active={tab === "account"}
            onClick={() => setTab("account")}
            icon="person"
          >
            Account
          </PixelTabButton>

          <PixelTabButton
            active={tab === "privacy"}
            onClick={() => setTab("privacy")}
            icon="lock"
          >
            Privacy
          </PixelTabButton>

          <PixelTabButton
            active={tab === "terms"}
            onClick={() => setTab("terms")}
            icon="description"
          >
            Terms
          </PixelTabButton>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto min-h-0 pixel-popup-content">
          {tab === "account" && <AccountTab />}
          {tab === "privacy" && <div className="pixel-text">Privacy content</div>}
          {tab === "terms" && <div className="pixel-text">Terms content</div>}
        </main>
      </div>
    </PixelPopup>
  );
}
