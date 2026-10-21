import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link2,
  Minus,
  Eraser,
  Type,
} from "lucide-react";

export default function VisualRichEditor({
  value = "",
  onChange,
  placeholder = "Start writing your article here... Select any text to format with Bold, Italic, Mark, or Headings.",
  readTime = "5 min read",
}) {
  const editorRef = useRef(null);
  const lastHtmlRef = useRef(null);

  // Active toolbar states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [currentBlock, setCurrentBlock] = useState("p");
  const [wordCount, setWordCount] = useState(0);

  const updateStats = useCallback(() => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, []);

  // Sync external value to innerHTML on initial mount or when value changes externally
  useEffect(() => {
    if (!editorRef.current) return;
    if (value !== lastHtmlRef.current || (value && !editorRef.current.innerHTML)) {
      editorRef.current.innerHTML = value || "";
      lastHtmlRef.current = value || "";
      updateStats();
    }
  }, [value, updateStats]);

  const handleInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    lastHtmlRef.current = html;
    updateStats();
    if (onChange) {
      onChange(html);
    }
    checkActiveStates();
  };

  const checkActiveStates = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));

      const block = document.queryCommandValue("formatBlock");
      if (block) {
        setCurrentBlock(block.toLowerCase().replace(/[<>]/g, ""));
      }
    } catch {
      // Ignore queryCommandState errors
    }
  }, []);

  const exec = (command, val = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, val);
    handleInput();
  };

  const applyBlockFormat = (tag) => {
    exec("formatBlock", `<${tag}>`);
    setCurrentBlock(tag);
  };

  const toggleMarkHighlight = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

    // Check if parent node is already mark
    let node = sel.anchorNode;
    while (node && node !== editorRef.current) {
      if (node.nodeName === "MARK") {
        const text = document.createTextNode(node.textContent || "");
        node.parentNode.replaceChild(text, node);
        handleInput();
        return;
      }
      node = node.parentNode;
    }

    // Wrap selection in <mark>
    const range = sel.getRangeAt(0);
    const mark = document.createElement("mark");
    mark.className = "bg-amber-200 text-amber-900 px-1 py-0.5 rounded font-semibold";
    try {
      mark.appendChild(range.extractContents());
      range.insertNode(mark);
      handleInput();
    } catch {
      // Fallback
      exec("hiliteColor", "#fef08a");
    }
  };

  const insertLink = () => {
    const url = window.prompt("Enter link URL (e.g., https://example.com):", "https://");
    if (url && url !== "https://") {
      exec("createLink", url);
    }
  };

  return (
    <div className="space-y-3">
      {/* Visual Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50/90 rounded-2xl border border-slate-200 shadow-xs select-none sticky top-18 z-10 backdrop-blur-xs">
        {/* Paragraph & Headings Selector */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyBlockFormat("p");
            }}
            title="Normal Paragraph"
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              currentBlock === "p"
                ? "bg-[#007BB5] text-white shadow-xs font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Type className="h-3.5 w-3.5" /> Normal
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyBlockFormat("h1");
            }}
            title="Heading 1"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
              currentBlock === "h1"
                ? "bg-[#007BB5] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Heading1 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyBlockFormat("h2");
            }}
            title="Heading 2"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
              currentBlock === "h2"
                ? "bg-[#007BB5] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyBlockFormat("h3");
            }}
            title="Heading 3"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
              currentBlock === "h3"
                ? "bg-[#007BB5] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Heading3 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Inline Formatting: Bold, Italic, Underline, Mark */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("bold");
            }}
            title="Bold (Ctrl+B)"
            className={`p-1.5 rounded-lg transition-all ${
              isBold ? "bg-[#007BB5] text-white shadow-xs font-black" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("italic");
            }}
            title="Italic (Ctrl+I)"
            className={`p-1.5 rounded-lg transition-all ${
              isItalic ? "bg-[#007BB5] text-white shadow-xs" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("underline");
            }}
            title="Underline (Ctrl+U)"
            className={`p-1.5 rounded-lg transition-all ${
              isUnderline ? "bg-[#007BB5] text-white shadow-xs" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Underline className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMarkHighlight();
            }}
            title="Highlight Text (Mark)"
            className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition-all flex items-center gap-1"
          >
            <Highlighter className="h-3.5 w-3.5" /> Mark
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Lists & Quotes */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertUnorderedList");
            }}
            title="Bullet List"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertOrderedList");
            }}
            title="Numbered List"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyBlockFormat("blockquote");
            }}
            title="Quote Block"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
          >
            <Quote className="h-4 w-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-slate-200 mx-0.5" />

        {/* Utilities: Link, Divider, Clear */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              insertLink();
            }}
            title="Insert Link"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertHorizontalRule");
            }}
            title="Insert Horizontal Divider"
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("removeFormat");
            }}
            title="Clear Formatting"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-all"
          >
            <Eraser className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Visual ContentEditable Canvas */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={checkActiveStates}
        onMouseUp={checkActiveStates}
        data-placeholder={placeholder}
        className="visual-editor min-h-[420px] p-6 rounded-3xl bg-white border border-slate-200/90 focus:outline-none focus:border-[#007BB5] focus:ring-4 focus:ring-[#007BB5]/10 text-slate-800 text-base leading-relaxed shadow-inner"
      />

      {/* Live Status Bar */}
      <div className="pt-2 px-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
        <span className="font-medium text-slate-500">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>
        <span>Estimated read time: ~{readTime}</span>
      </div>
    </div>
  );
}
