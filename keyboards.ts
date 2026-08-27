import { InlineKeyboard } from "grammy";
import type { BroadcastButton, MenuItem, SupportIntent } from "../types/index.ts";

// ─── User keyboards ───────────────────────────────────────────────────────────

export function mainMenuKeyboard(items: MenuItem[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const item of items) {
    if (item.url) {
      kb.url(item.label, item.url).row();
    } else {
      kb.text(item.label, item.action).row();
    }
  }
  kb.text("🎧 Support", "support:open").row();
  kb.text("🔙 Back", "nav:broadcast");
  return kb;
}

export function broadcastKeyboard(buttons: BroadcastButton[][]): InlineKeyboard {
  const kb = new InlineKeyboard();
  for (const row of buttons) {
    for (const btn of row) {
      if (btn.action === "url") {
        kb.url(btn.text, btn.value);
      } else {
        kb.text(btn.text, `${btn.action}:${btn.value}`);
      }
    }
    kb.row();
  }
  kb.text("☰ Menu", "nav:menu");
  return kb;
}

export function supportIntentKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("💳 Payment",      "support:payment").row()
    .text("📦 Order",        "support:order").row()
    .text("🤝 Partnership",  "support:partnership").row()
    .text("🚨 Report",       "support:report").row()
    .text("❓ Other",        "support:other").row()
    .text("🔙 Back",         "nav:broadcast");
}

// ─── Admin keyboards ──────────────────────────────────────────────────────────

export function adminPanelKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("📢 Broadcast",    "admin:broadcast").row()
    .text("🌐 Community",    "admin:community").row()
    .text("👥 Subscribers",  "admin:subscribers").row()
    .text("📥 Inbox",        "admin:inbox").row()
    .text("📊 Data",         "admin:data").row()
    .text("⚙️ Settings",    "admin:settings").row()
    .text("❓ Help",         "admin:help");
}

export function broadcastActionsKeyboard(draftId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("✏️ Edit Text",   `bc:edit_text:${draftId}`).row()
    .text("🖼 Set Media",   `bc:set_media:${draftId}`).row()
    .text("🔘 Add Buttons", `bc:add_buttons:${draftId}`).row()
    .text("🎯 Set Target",  `bc:set_target:${draftId}`).row()
    .text("⏰ Schedule",    `bc:schedule:${draftId}`).row()
    .text("📤 Send Now",    `bc:send:${draftId}`).row()
    .text("💾 Save Draft",  `bc:save_draft:${draftId}`).row()
    .text("🔙 Panel",       "admin:panel");
}

export function communityActionsKeyboard(communityId: string): InlineKeyboard {
  const id = encodeURIComponent(communityId);
  return new InlineKeyboard()
    .text("📝 New Post",       `cm:new_post:${id}`).row()
    .text("✏️ Edit Post",     `cm:edit_post:${id}`).row()
    .text("⏰ Schedule Post",  `cm:schedule:${id}`).row()
    .text("🔇 Send Silently",  `cm:silent:${id}`).row()
    .text("❌ Delete Buttons", `cm:del_buttons:${id}`).row()
    .text("🗑 Delete Message", `cm:del_msg:${id}`).row()
    .text("📊 Stats",          `cm:stats:${id}`).row()
    .text("🔙 Panel",          "admin:panel");
}

export function inboxActionsKeyboard(msgId: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("↩️ Reply",    `inbox:reply:${msgId}`).row()
    .text("✅ Resolve",  `inbox:resolve:${msgId}`).row()
    .text("🗄 Archive",  `inbox:archive:${msgId}`).row()
    .text("🔙 Inbox",    "admin:inbox");
}

export function confirmKeyboard(action: string): InlineKeyboard {
  return new InlineKeyboard()
    .text("✅ Confirm", `confirm:yes:${action}`)
    .text("❌ Cancel",  `confirm:no:${action}`);
}

export function backKeyboard(target: string): InlineKeyboard {
  return new InlineKeyboard().text("🔙 Back", target);
}
