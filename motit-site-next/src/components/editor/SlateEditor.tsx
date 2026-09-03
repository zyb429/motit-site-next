'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { createEditor, Transforms, Editor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import type { CustomEditor, CustomElement, CustomText, SlateEditorProps } from '@/types/slate';

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const INITIAL_VALUE: CustomElement[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

const Toolbar = ({ editor }: { editor: CustomEditor }) => {
  const toggleMark = (format: keyof Omit<CustomText, 'text'>) => {
    const isActive = Editor.marks(editor)?.[format] === true;
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const isMarkActive = (format: keyof Omit<CustomText, 'text'>) => {
    return Editor.marks(editor)?.[format] === true;
  };

  const toggleBlock = (format: CustomElement['type']) => {
    const isActive = isBlockActive(editor, format);
    Transforms.setNodes(editor, {
      type: isActive ? 'paragraph' : format,
    });
  };

  const isBlockActive = (editor: CustomEditor, format: CustomElement['type']) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => {
        if (Editor.isEditor(n)) return false;
        return 'type' in n && n.type === format;
      },
    });
    return !!match;
  };

  const btnClass = (active: boolean) =>
    `px-2.5 py-1.5 rounded text-sm font-medium transition-colors ${
      active ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50/80">
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleMark('bold')}
        className={btnClass(isMarkActive('bold'))}
        title="Жирный (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleMark('italic')}
        className={btnClass(isMarkActive('italic'))}
        title="Курсив (Ctrl+I)"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleMark('underline')}
        className={btnClass(isMarkActive('underline'))}
        title="Подчеркнутый (Ctrl+U)"
      >
        <u>U</u>
      </button>
      <span className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock('heading-one')}
        className={btnClass(isBlockActive(editor, 'heading-one'))}
        title="Заголовок H1"
      >
        H1
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock('heading-two')}
        className={btnClass(isBlockActive(editor, 'heading-two'))}
        title="Заголовок H2"
      >
        H2
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock('heading-three')}
        className={btnClass(isBlockActive(editor, 'heading-three'))}
        title="Заголовок H3"
      >
        H3
      </button>
      <span className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock('bulleted-list')}
        className={btnClass(isBlockActive(editor, 'bulleted-list'))}
        title="Маркированный список"
      >
        • Список
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock('numbered-list')}
        className={btnClass(isBlockActive(editor, 'numbered-list'))}
        title="Нумерованный список"
      >
        1. Список
      </button>
      <span className="w-px h-6 bg-gray-300 mx-1" />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleBlock('block-quote')}
        className={btnClass(isBlockActive(editor, 'block-quote'))}
        title="Цитата"
      >
        &ldquo;
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => toggleMark('code')}
        className={btnClass(isMarkActive('code'))}
        title="Код"
      >
        {'<>'}
      </button>
    </div>
  );
};

const SlateEditor: React.FC<SlateEditorProps> = ({
  onChange,
  initialValue,
  placeholder = 'Введите текст поста...',
  className = '',
  readOnly = false,
}) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const [value, setValue] = useState<CustomElement[]>(initialValue || INITIAL_VALUE);

  const handleChange = useCallback(
    (newValue: CustomElement[]) => {
      setValue(newValue);
      onChange?.(newValue);
    },
    [onChange]
  );

  const renderElement = useCallback(({ attributes, children, element }: any) => {
    switch (element.type) {
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>;
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>;
      case 'heading-three':
        return <h3 {...attributes}>{children}</h3>;
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>;
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>;
      case 'code-block':
        return (
          <pre {...attributes} className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <code>{children}</code>
          </pre>
        );
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = useCallback(({ attributes, children, leaf }: any) => {
    let formatted = children;
    if (leaf.bold) formatted = <strong>{formatted}</strong>;
    if (leaf.italic) formatted = <em>{formatted}</em>;
    if (leaf.underline) formatted = <u>{formatted}</u>;
    if (leaf.code) formatted = <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{formatted}</code>;
    return <span {...attributes}>{formatted}</span>;
  }, []);

  return (
    <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
      {!readOnly && <Toolbar editor={editor} />}
      <Slate editor={editor} initialValue={value} onChange={handleChange}>
        <Editable
          className={`min-h-[300px] p-4 focus:outline-none ${readOnly ? 'cursor-default' : ''}`}
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