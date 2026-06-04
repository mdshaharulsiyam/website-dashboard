import { useEffect, useRef, type ClipboardEvent } from "react";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  RemoveFormatting,
  Underline,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeightClassName?: string;
};

export function isRichTextEmpty(value: string) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length === 0;
}

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  minHeightClassName = "min-h-[260px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  function runCommand(command: string, commandValue?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  }

  function addLink() {
    const url = window.prompt("Enter URL");
    if (!url) return;
    runCommand("createLink", url);
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");

    if (html) {
      document.execCommand("insertHTML", false, html);
    } else {
      document.execCommand("insertText", false, text);
    }

    onChange(editorRef.current?.innerHTML ?? "");
  }

  const toolbar = [
    { label: "Heading 1", icon: Heading1, action: () => runCommand("formatBlock", "h1") },
    { label: "Heading 2", icon: Heading2, action: () => runCommand("formatBlock", "h2") },
    { label: "Bold", icon: Bold, action: () => runCommand("bold") },
    { label: "Italic", icon: Italic, action: () => runCommand("italic") },
    { label: "Underline", icon: Underline, action: () => runCommand("underline") },
    { label: "Bulleted List", icon: List, action: () => runCommand("insertUnorderedList") },
    { label: "Numbered List", icon: ListOrdered, action: () => runCommand("insertOrderedList") },
    { label: "Quote", icon: Quote, action: () => runCommand("formatBlock", "blockquote") },
    { label: "Link", icon: Link2, action: addLink },
    { label: "Clear Format", icon: RemoveFormatting, action: () => runCommand("removeFormat") },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {toolbar.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              key={item.label}
              type="button"
              variant="ghost"
              size="icon-sm"
              title={item.label}
              aria-label={item.label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={item.action}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>
      <div
        id={id}
        ref={editorRef}
        contentEditable
        data-placeholder={placeholder}
        className={cn(
          "w-full overflow-auto px-4 py-3 text-sm leading-6 text-slate-800 outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-300 [&_blockquote]:pl-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5",
          minHeightClassName,
        )}
        onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
        onPaste={handlePaste}
        suppressContentEditableWarning
      />
    </div>
  );
}
