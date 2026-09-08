"use client";

import { Fragment } from "react";
import type { CustomElement } from "@/types/slate";

type RenderSlateProps = {
  nodes: CustomElement[];
  className?: string;
};

// Вспомогательная функция для безопасного получения текста
const getTextContent = (node: any): string => {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (node.text) return node.text;
  if (node.children && Array.isArray(node.children)) {
    return node.children.map((child: any) => getTextContent(child)).join("");
  }
  return "";
};

// Вспомогательная функция для рендеринга детей с форматированием
const renderChildren = (children: any[]): React.ReactNode => {
  if (!children || !Array.isArray(children)) return null;

  return children.map((child, index) => {
    if (typeof child === "string") {
      return <span key={index}>{child}</span>;
    }

    // Если это текстовый узел с форматированием
    if (child.text !== undefined) {
      let content = child.text || "";

      if (child.bold) content = <strong key="bold">{content}</strong>;
      if (child.italic) content = <em key="italic">{content}</em>;
      if (child.underline) content = <u key="underline">{content}</u>;
      if (child.code)
        content = (
          <code key="code" className="bg-gray-800 px-1 py-0.5 rounded text-sm">
            {content}
          </code>
        );

      return <Fragment key={index}>{content}</Fragment>;
    }

    // Рекурсивно рендерим вложенные элементы
    if (child.children) {
      return renderChildren(child.children);
    }

    return null;
  });
};

export default function RenderSlate({
  nodes,
  className = "",
}: RenderSlateProps) {
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return <p className="text-gray-500">Нет содержимого</p>;
  }

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {nodes.map((node, index) => {
        // Проверяем, является ли узел текстовым
        if ("text" in node && typeof node.text === "string") {
          return <span key={index}>{node.text}</span>;
        }

        // Проверяем, есть ли у узла тип
        if (!node.type) {
          return <span key={index}>{getTextContent(node)}</span>;
        }

        const children = (node as any).children || [];

        switch (node.type) {
          case "heading-one":
            return <h1 key={index}>{renderChildren(children)}</h1>;

          case "heading-two":
            return <h2 key={index}>{renderChildren(children)}</h2>;

          case "heading-three":
            return <h3 key={index}>{renderChildren(children)}</h3>;

          case "bulleted-list":
            return (
              <ul key={index}>
                {(children as any[]).map((item, i) => (
                  <li key={i}>
                    {renderChildren((item as any).children || [])}
                  </li>
                ))}
              </ul>
            );

          case "numbered-list":
            return (
              <ol key={index}>
                {(children as any[]).map((item, i) => (
                  <li key={i}>
                    {renderChildren((item as any).children || [])}
                  </li>
                ))}
              </ol>
            );

          case "list-item":
            return <li key={index}>{renderChildren(children)}</li>;

          case "block-quote":
            return (
              <blockquote
                key={index}
                className="border-l-4 border-[#2dd4bf] pl-4 italic"
              >
                {renderChildren(children)}
              </blockquote>
            );

          case "code-block":
            return (
              <pre
                key={index}
                className="bg-gray-800 p-4 rounded-lg overflow-x-auto"
              >
                <code>{renderChildren(children)}</code>
              </pre>
            );

          default:
            return <p key={index}>{renderChildren(children)}</p>;
        }
      })}
    </div>
  );
}
