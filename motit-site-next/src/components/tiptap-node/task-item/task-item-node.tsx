"use client";

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";

export function TaskItemNode(props: NodeViewProps) {
  const { node, updateAttributes, editor } = props;
  const checked = node.attrs.checked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor.isEditable) return;
    updateAttributes({ checked: e.target.checked });
  };

  return (
    <NodeViewWrapper
      as="li"
      data-type="taskItem"
      data-checked={checked ? "true" : "false"}
      className="task-item-wrapper"
    >
      <label contentEditable={false} className="task-item-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={!editor.isEditable}
        />
      </label>
      <div className="task-item-content">
        <NodeViewContent as="div" />
      </div>
    </NodeViewWrapper>
  );
}