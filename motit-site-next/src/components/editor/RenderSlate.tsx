'use client';

import type { CustomElement } from '@/types/slate';

type RenderSlateProps = {
  nodes: CustomElement[];
  className?: string;
};

export default function RenderSlate({ nodes, className = '' }: RenderSlateProps) {
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return <p className="text-gray-500">Нет содержимого</p>;
  }

  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      {nodes.map((node, index) => {
        if (!node.type) {
          return <span key={index}>{node.text || ''}</span>;
        }

        switch (node.type) {
          case 'heading-one':
            return <h1 key={index}>{node.children[0]?.text}</h1>;
          case 'heading-two':
            return <h2 key={index}>{node.children[0]?.text}</h2>;
          case 'heading-three':
            return <h3 key={index}>{node.children[0]?.text}</h3>;
          case 'bulleted-list':
            return (
              <ul key={index}>
                {node.children.map((item, i) => (
                  <li key={i}>{item.children[0]?.text}</li>
                ))}
              </ul>
            );
          case 'numbered-list':
            return (
              <ol key={index}>
                {node.children.map((item, i) => (
                  <li key={i}>{item.children[0]?.text}</li>
                ))}
              </ol>
            );
          case 'list-item':
            return <li key={index}>{node.children[0]?.text}</li>;
          case 'block-quote':
            return (
              <blockquote key={index} className="border-l-4 border-[#2dd4bf] pl-4 italic">
                {node.children[0]?.text}
              </blockquote>
            );
          case 'code-block':
            return (
              <pre key={index} className="bg-gray-800 p-4 rounded-lg overflow-x-auto">
                <code>{node.children[0]?.text}</code>
              </pre>
            );
          default:
            return <p key={index}>{node.children[0]?.text}</p>;
        }
      })}
    </div>
  );
}