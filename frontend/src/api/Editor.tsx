"use client";

import { useLiveblocksExtension, FloatingToolbar } from "@liveblocks/react-tiptap";
import React from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Threads } from "./Threads.tsx";

export function Editor() {
  const liveblocks = useLiveblocksExtension();

  const editor = useEditor({
    extensions: [
      liveblocks,
      StarterKit.configure({
        // The Liveblocks extension comes with its own history handling
        history: false,
      }),
    ],
  });

  return (
    <div>
      <EditorContent editor={editor} className="editor" />
      <Threads editor={editor} />
      <FloatingToolbar editor={editor} />
    </div>
  );
}