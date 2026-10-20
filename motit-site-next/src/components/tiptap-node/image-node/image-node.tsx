"use client";

import { useState } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { openEditorModal } from "@rageshpikalmunde/rp-image-editor";
import { handleImageUpload } from "@/lib/tiptap-utils";
import "@/components/tiptap-node/image-node/image-node.scss";

export function ImageNode(props: NodeViewProps) {
  const { src, alt, title, width, height } = props.node.attrs;
  const [isEditing, setIsEditing] = useState(false);

  async function handleEdit() {
    if (!src || isEditing) return;
    try {
      setIsEditing(true);

      // 1. Загружаем текущее изображение как File
      const res = await fetch(src);
      if (!res.ok) throw new Error("Не удалось загрузить изображение");
      const blob = await res.blob();
      const file = new File([blob], "image.jpg", {
        type: blob.type || "image/jpeg",
      });

      // 2. Открываем модал редактора
      const result = await openEditorModal({
        image: file,
        config: {
          exportFormat: "jpeg",
          exportQuality: 0.92,
          maxUndoSteps: 30,
          language: "en",
        },
      });

      if (!result?.file) return;

      // 3. Загружаем отредактированный файл через /api/upload
      const newUrl = await handleImageUpload(result.file);

      // 4. Обновляем узел в редакторе
      props.updateAttributes({ src: newUrl });
    } catch (err) {
      console.error("Image edit error:", err);
      alert(err instanceof Error ? err.message : "Не удалось отредактировать");
    } finally {
      setIsEditing(false);
    }
  }

  if (!src) {
    return (
      <NodeViewWrapper className="image-node-wrapper">
        <div className="image-node-error">Ошибка загрузки изображения</div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="image-node-wrapper">
      <div className="image-node-container" style={{ position: "relative" }}>
        <img
          src={src}
          alt={alt || ""}
          title={title || ""}
          width={width || undefined}
          height={height || undefined}
          className="tiptap-image"
          data-drag-handle
          onClick={handleEdit}
          style={{ cursor: isEditing ? "wait" : "pointer" }}
        />
        {isEditing && (
          <div className="image-node-overlay">
            <div className="image-node-spinner" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}