"use client";

import React from "react";
import { AVATAR_CHARACTERS, type AvatarCharacter } from "./AzureAvatar";
import { cn } from "@/lib/utils";

interface AzureAvatarSelectorProps {
  selectedId: string;
  onSelect: (characterId: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

const AVATAR_EMOJIS: Record<string, string> = {
  lisa: "👩",
  harry: "👨",
  jeff: "🧑",
};

export default function AzureAvatarSelector({
  selectedId,
  onSelect,
  disabled = false,
  compact = false,
}: AzureAvatarSelectorProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {AVATAR_CHARACTERS.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char.id)}
            disabled={disabled}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
              selectedId === char.id
                ? "bg-purple-600 text-white ring-2 ring-purple-300 scale-110"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            title={`${char.name} — ${char.description}`}
          >
            {AVATAR_EMOJIS[char.id] || "🧑"}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {AVATAR_CHARACTERS.map((char) => (
        <button
          key={char.id}
          onClick={() => onSelect(char.id)}
          disabled={disabled}
          className={cn(
            "flex-1 p-2.5 rounded-xl border-2 transition-all text-left",
            selectedId === char.id
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-sm"
              : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="text-center space-y-1">
            <div className="text-2xl">{AVATAR_EMOJIS[char.id] || "🧑"}</div>
            <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              {char.name}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
              {char.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
