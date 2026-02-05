"use client";

import { useState, forwardRef, useRef, useImperativeHandle } from "react";
import { GlobalModal, GlobalModalRef } from "@/features/ui/modal";
import { PixelTabButton } from "@/features/ui/PixelTabButton";
import { AccountTab } from "./accountTab";
import { PixelButton } from "@/features/ui";

type TabKey = "account" | "privacy" | "terms";

export const SettingsModal = forwardRef<GlobalModalRef>((props, ref) => {
  const [tab, setTab] = useState<TabKey>("account");
  const modalRef = useRef<GlobalModalRef>(null);

  useImperativeHandle(ref, () => ({
    open: (args) => modalRef.current?.open(args) as Promise<any>,
    close: (args) => modalRef.current?.close(args),
  }));

  return (
    <GlobalModal
      ref={modalRef}
      classNames={{
        panel: "h-[75vh]"
      }}
      header={
        <>
          <div className="pixel-text-title text-xl">SETTINGS</div>
          <div className="text-xs text-[color:var(--game-muted)]">
            Manage your account
          </div>
        </>
      }
      footer={
        <PixelButton 
            size="lg" 
            variant="danger" 
            type="button" 
            onClick={() => modalRef.current?.close()}
        >
          Close
        </PixelButton>
      }
      description={
        <div className="grid grid-cols-1 md:grid-cols-[14rem_1fr] h-full min-h-0">
          {/* SIDEBAR */}
          <aside
            className="
              border-b-4 md:border-b-0
              md:border-r-4
              border-[color:var(--pixel-border)]
              p-3
              flex md:flex-col gap-2
              overflow-x-auto
            "
          >
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
          <div className="min-h-0 overflow-y-auto p-6">
            {tab === "account" && <AccountTab />}
            {tab === "privacy" && <div className="pixel-text">Privacy content</div>}
            {tab === "terms" && <div className="pixel-text">Terms content</div>}
          </div>
        </div>
      }
    />
  );
});

SettingsModal.displayName = "SettingsModal";
