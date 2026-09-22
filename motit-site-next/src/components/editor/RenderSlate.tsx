"use client";

import { Fragment } from "react";
import { Element, Text, type Descendant } from "slate";
import type { CustomElement } from "@/types/slate";

type RenderSlateProps = {
  nodes: CustomElement[];
  className?: string;
};

// Вспомогательная функция для безопасного получения текста
const getTextContent = (node: Descendant): string => {
  if (!node) return "";
  if (Text.isText(node)) return node.text;
  if (Element.isElement(node) && Array.isArray(node.children)) {
    return node.children.map((child) => getTextContent(child)).join("");
  }
  return "";
};

// Рендер текстового узла с форматированием
const renderTextNode = (node: Text, key: number): React.ReactNode => {
  let content: React.ReactNode = node.text;

  // Порядок важен: code → underline → italic → bold (изнутри наружу)
  if (node.code) {
    content = (
      <code className="bg-gray-800 px-1 py-0.5 rounded text-sm">
        {content}
      </code>
    );
  }
  if (node.underline) content = <u>{content}</u>;
  if (node.italic) content = <em>{content}</em>;
  if (node.bold) content = <strong>{content}</strong>;

  return <Fragment key={key}>{content}</Fragment>;
};

// Рекурсивный рендер детей
const renderChildren = (children: Descendant[]): React.ReactNode => {
  if (!children || !Array.isArray(children)) return null;

  return children.map((child, index) => {
    if (Text.isText(child)) {
      return renderTextNode(child, index);
    }

    if (Element.isElement(child)) {
      // Вложенный элемент — рендерим его детей
      return <Fragment key={index}>{renderChildren(child.children)}</Fragment>;
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
        // Текстовый узел на верхнем уровне
        if (Text.isText(node)) {
          return <span key={index}>{node.text}</span>;
        }

        // Не элемент — рендерим как текст
        if (!Element.isElement(node) || !node.type) {
          return <span key={index}>{getTextContent(node)}</span>;
        }

        const children = node.children;

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
                {children.map((item, i) => (
                  <li key={i}>
                    {Element.isElement(item)
                      ? renderChildren(item.children)
                      : null}
                  </li>
                ))}
              </ul>
            );

          case "numbered-list":
            return (
              <ol key={index}>
                {children.map((item, i) => (
                  <li key={i}>
                    {Element.isElement(item)
                      ? renderChildren(item.children)
                      : null}
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
