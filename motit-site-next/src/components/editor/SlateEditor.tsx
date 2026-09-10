"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { createEditor, Transforms, Editor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import type {
  CustomEditor,
  CustomElement,
  CustomText,
  SlateEditorProps,
} from "@/types/slate";

const INITIAL_VALUE: CustomElement[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

const Toolbar = ({ editor }: { editor: CustomEditor }) => {
  const toggleMark = (format: keyof Omit<CustomText, "text">) => {
    const isActive = Editor.marks(editor)?.[format] === true;
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const isMarkActive = (format: keyof Omit<CustomText, "text">) => {
    return Editor.marks(editor)?.[format] === true;
  };

  const toggleBlock = (format: CustomElement["type"]) => {
    const isActive = isBlockActive(editor, format);
    Transforms.setNodes(editor, {
      type: isActive ? "paragraph" : format,
    });
  };

  const isBlockActive = (
    editor: CustomEditor,
    format: CustomElement["type"],
  ) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => {
        if (Editor.isEditor(n)) return false;
        return "type" in n && n.type === format;
      },
    });
    return !!match;
  };

  const btnClass = (active: boolean) =>
    `px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${
      active
        ? "bg-blue-600 text-white"
        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50/80 text-black">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleMark("bold")}
        className={btnClass(isMarkActive("bold"))}
        title="Жирный (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleMark("italic")}
        className={btnClass(isMarkActive("italic"))}
        title="Курсив (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleMark("underline")}
        className={btnClass(isMarkActive("underline"))}
        title="Подчеркнутый (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <span className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock("heading-one")}
        className={btnClass(isBlockActive(editor, "heading-one"))}
        title="Заголовок H1"
      >
        H1
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock("heading-two")}
        className={btnClass(isBlockActive(editor, "heading-two"))}
        title="Заголовок H2"
      >
        H2
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock("heading-three")}
        className={btnClass(isBlockActive(editor, "heading-three"))}
        title="Заголовок H3"
      >
        H3
      </button>
      <span className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock("bulleted-list")}
        className={btnClass(isBlockActive(editor, "bulleted-list"))}
        title="Маркированный список"
      >
        • Список
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock("numbered-list")}
        className={btnClass(isBlockActive(editor, "numbered-list"))}
        title="Нумерованный список"
      >
        1. Список
      </button>
      <span className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock("block-quote")}
        className={btnClass(isBlockActive(editor, "block-quote"))}
        title="Цитата"
      >
        &ldquo;
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleMark("code")}
        className={btnClass(isMarkActive("code"))}
        title="Код"
      >
        {"<>"}
      </button>
    </div>
  );
};

const SlateEditor: React.FC<SlateEditorProps> = ({
  onChange,
  initialValue,
  placeholder = "Введите текст поста...",
  className = "",
  readOnly = false,
}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  // Безопасное создание значения
  const getSafeValue = useCallback((value?: CustomElement[] | null) => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      console.log("Нет значения, используем INITIAL_VALUE");
      return INITIAL_VALUE;
    }

    const isValid = value.every((node) => {
      if (
        !node.children ||
        !Array.isArray(node.children) ||
        node.children.length === 0
      ) {
        console.warn("Узел без children:", node);
        return false;
      }

      const hasValidChildren = node.children.every((child: any) => {
        if (typeof child === "object" && child !== null && "text" in child) {
          return true;
        }
        console.warn("Дочерний элемент без text:", child);
        return false;
      });

      return hasValidChildren;
    });

    if (!isValid) {
      console.warn("Некорректная структура, используем INITIAL_VALUE");
      return INITIAL_VALUE;
    }
    return value;
  }, []);

  const [value, setValue] = useState<CustomElement[]>(() => {
    const safeValue = getSafeValue(initialValue);
    console.log("Инициализация редактора: ", safeValue);
    return safeValue;
  });

  useEffect(() => {
    if (initialValue) {
      const safeValue = getSafeValue(initialValue);
      setValue(safeValue);
    }
  }, [initialValue, getSafeValue]);

  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      if (!newValue || !Array.isArray(newValue) || newValue.length === 0) {
        console.warn("handleChange: пустое значение");
        return;
      }

      const isValid = newValue.every((node: any) => {
        if (
          !node.children ||
          !Array.isArray(node.children) ||
          node.children.length === 0
        ) {
          return false;
        }
        return node.children.every((child: any) => {
          return typeof child === "object" && child !== null && "text" in child;
        });
      });

      if (!isValid) {
        console.warn("handleChange: некорректная структура");
        return;
      }

      const typedValue = newValue as CustomElement[];
      setValue(typedValue);
      onChange?.(typedValue);
    },
    [onChange],
  );

  const renderElement = useCallback(
    ({ attributes, children, element }: any) => {
      if (!element?.type) {
        return <p {...attributes}>{children || " "}</p>;
      }

      if (!children) {
        return <p {...attributes}> </p>;
      }

      switch (element.type) {
        case "heading-one":
          return (
            <h1 {...attributes} className="text-4xl font-bold my-4">
              {children}
            </h1>
          );
        case "heading-two":
          return (
            <h2 {...attributes} className="text-3xl font-semibold my-3">
              {children}
            </h2>
          );
        case "heading-three":
          return (
            <h3 {...attributes} className="text-2xl font-medium my-2">
              {children}
            </h3>
          );
        case "bulleted-list":
          return (
            <ul {...attributes} className="list-disc pl-6 my-2">
              {children}
            </ul>
          );
        case "numbered-list":
          return (
            <ol {...attributes} className="list-decimal pl-6 my-2">
              {children}
            </ol>
          );
        case "list-item":
          return (
            <li {...attributes} className="my-1">
              {children}
            </li>
          );
        case "block-quote":
          return (
            <blockquote
              {...attributes}
              className="border-l-4 border-gray-300 pl-4 my-2"
            >
              {children}
            </blockquote>
          );
        case "code-block":
          return (
            <pre
              {...attributes}
              className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-2"
            >
              <code>{children}</code>
            </pre>
          );
        default:
          return (
            <p {...attributes} className="my-1">
              {children}
            </p>
          );
      }
    },
    [],
  );

  const renderLeaf = useCallback(({ attributes, children, leaf }: any) => {
    if (!leaf) {
      return <span {...attributes}>{children || ""}</span>;
    }

    if (!children) {
      return <span {...attributes}> </span>;
    }

    let formatted = children;

    if (leaf.bold) {
      formatted = <strong className="font-bold">{formatted}</strong>;
    }
    if (leaf.italic) {
      formatted = <em className="italic">{formatted}</em>;
    }
    if (leaf.underline) {
      formatted = <u className="underline">{formatted}</u>;
    }
    if (leaf.strikethrough) {
      formatted = <s className="line-through">{formatted}</s>;
    }
    if (leaf.code) {
      formatted = (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-black">
          {formatted}
        </code>
      );
    }

    return <span {...attributes}>{formatted}</span>;
  }, []);

  return (
    <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
      {!readOnly && <Toolbar editor={editor} />}
      <Slate editor={editor} initialValue={value} onChange={handleChange}>
        <Editable
          className={`min-h-75 p-4 focus:outline-none text-black placeholder-gray-700 ${
            readOnly ? "cursor-default" : ""
          }`}
          placeholder={placeholder}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          readOnly={readOnly}
          spellCheck={!readOnly}
        />
      </Slate>
    </div>
  );
};

export default SlateEditor;
