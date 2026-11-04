"use client";

import { Puck, type Config, type Data, createUsePuck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Smartphone,
  Tablet,
  Monitor,
  PlusCircle,
  Check,
  X,
  Laptop,
  Upload,
  Sun,
  Moon,
} from "lucide-react";
import { createPuckConfig } from "@/lib/puck/config";
import type { SocialOption } from "@/lib/social-options";

const usePuck = createUsePuck();

const BASE_VIEWPORTS = [
  { width: 375, height: 812, label: "Mobile", icon: <Smartphone size={16} /> },
  { width: 768, height: 1024, label: "Tablet", icon: <Tablet size={16} /> },
  { width: 1280, height: 800, label: "Desktop", icon: <Laptop size={16} /> },
  { width: 1536, height: 960, label: "Wide", icon: <Monitor size={16} /> },
];

/**
 * Хук для синхронизации темы с iframe Puck.
 * Ищет iframe по селектору, периодически проверяет его наличие
 * и добавляет/убирает класс .dark на <html> внутри iframe.
 */
function useSyncPreviewTheme(previewTheme: "light" | "dark") {
  useEffect(() => {
    const applyTheme = () => {
      const iframe = document.querySelector("iframe") as HTMLIFrameElement | null;
      if (!iframe) return;

      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        const html = doc.documentElement;
        if (previewTheme === "dark") {
          html.classList.add("dark");
          html.setAttribute("data-theme", "dark");
          html.style.colorScheme = "dark";
        } else {
          html.classList.remove("dark");
          html.setAttribute("data-theme", "light");
          html.style.colorScheme = "light";
        }
      } catch {
        // cross-origin iframe — пропускаем
      }
    };

    // Пытаемся сразу и несколько раз с интервалом, пока iframe не появится
    applyTheme();
    const interval = setInterval(applyTheme, 300);

    // Также наблюдаем за изменениями в DOM
    const observer = new MutationObserver(applyTheme);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [previewTheme]);
}

function InnerPuckShell({
  onPublish,
  viewport,
  setViewport,
  isCustomPanelOpen,
  setIsCustomPanelOpen,
  tempWidth,
  setTempWidth,
  tempHeight,
  setTempHeight,
  handleApplyCustom,
  isCustomSize,
  previewTheme,
  setPreviewTheme,
}: {
  onPublish: (data: Data) => Promise<void>;
  viewport: { width: number; height: number };
  setViewport: (v: { width: number; height: number }) => void;
  isCustomPanelOpen: boolean;
  setIsCustomPanelOpen: (v: boolean) => void;
  tempWidth: string;
  setTempWidth: (v: string) => void;
  tempHeight: string;
  setTempHeight: (v: string) => void;
  handleApplyCustom: () => void;
  isCustomSize: boolean;
  previewTheme: "light" | "dark";
  setPreviewTheme: (v: "light" | "dark") => void;
}) {
  const appState = usePuck((s) => s.appState);
  const [isPublishing, setIsPublishing] = useState(false);
  const [scale, setScale] = useState(1);

  useSyncPreviewTheme(previewTheme);

  useEffect(() => {
    const updateScale = () => {
      if (typeof window === "undefined") return;
      setScale(Math.min(1, (window.innerWidth * 0.5) / viewport.width));
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [viewport.width]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish(appState.data);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <header className="flex items-center justify-between w-full px-4 py-2 border-b border-(--puck-color-border) bg-(--puck-color-surface) shrink-0">
        <div className="flex items-center gap-2">
          {BASE_VIEWPORTS.map((v) => (
            <button
              key={v.label}
              onClick={() => setViewport({ width: v.width, height: v.height })}
              title={`${v.label} (${v.width}×${v.height})`}
              className={`p-2 rounded-md transition-colors flex items-center gap-2 ${
                viewport.width === v.width && viewport.height === v.height
                  ? "bg-(--puck-color-interactive-active) text-white"
                  : "hover:bg-(--puck-color-surface-subtle) text-(--puck-color-text)"
              }`}
            >
              {v.icon}
              <span className="text-sm hidden md:inline">
                {v.width}×{v.height}
              </span>
            </button>
          ))}

          <button
            onClick={() => setIsCustomPanelOpen(true)}
            title="Настроить кастомный размер"
            className={`p-2 rounded-md transition-colors flex items-center gap-2 ${
              isCustomSize
                ? "bg-(--puck-color-interactive-active) text-white"
                : "hover:bg-(--puck-color-surface-subtle) text-(--puck-color-text)"
            }`}
          >
            <PlusCircle size={16} />
            <span className="text-sm hidden md:inline">
              {isCustomSize ? `${viewport.width}×${viewport.height}` : "Custom"}
            </span>
          </button>

          <div className="flex items-center gap-1 ml-4 pl-4 border-l border-(--puck-color-border)">
            <button
              onClick={() => setPreviewTheme("light")}
              title="Светлая тема для preview"
              className={`p-2 rounded-md transition-colors ${
                previewTheme === "light"
                  ? "bg-(--puck-color-interactive-active) text-white"
                  : "hover:bg-(--puck-color-surface-subtle) text-(--puck-color-text)"
              }`}
            >
              <Sun size={16} />
            </button>
            <button
              onClick={() => setPreviewTheme("dark")}
              title="Тёмная тема для preview"
              className={`p-2 rounded-md transition-colors ${
                previewTheme === "dark"
                  ? "bg-(--puck-color-interactive-active) text-white"
                  : "hover:bg-(--puck-color-surface-subtle) text-(--puck-color-text)"
              }`}
            >
              <Moon size={16} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishing}
          className="px-4 py-2 rounded-md bg-(--puck-color-interactive) text-white hover:bg-(--puck-color-interactive-hover) disabled:opacity-50 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Upload size={16} />
          {isPublishing ? "Сохранение..." : "Опубликовать"}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-64 shrink-0 overflow-y-auto border-r border-(--puck-color-border) bg-(--puck-color-surface) hidden md:block">
          <Puck.Components />
        </div>

        <div className="flex-1 overflow-auto bg-(--puck-color-surface-muted) p-6 flex justify-center items-start">
          <div
            className="relative shrink-0 origin-top transition-transform duration-200"
            style={{
              width: `${viewport.width}px`,
              height: `${viewport.height}px`,
              transform: `scale(${scale})`,
            }}
          >
            <div className="absolute -top-6 left-0 right-0 text-center text-xs text-(--puck-color-text-muted) font-mono pointer-events-none z-10">
              {viewport.width} × {viewport.height} px
            </div>
            <div className="w-full h-full">
              <Puck.Preview />
            </div>
          </div>
        </div>

        <div className="w-80 shrink-0 overflow-y-auto border-l border-(--puck-color-border) bg-(--puck-color-surface) flex flex-col">
          {isCustomPanelOpen && (
            <div className="p-4 border-b border-(--puck-color-border) bg-(--puck-color-surface-muted) shrink-0">
              <div className="flex items-center justify-between mb-3 text-xs font-semibold uppercase tracking-wider text-(--puck-color-text-muted)">
                <span>Размер (px)</span>
                <button
                  type="button"
                  onClick={() => setIsCustomPanelOpen(false)}
                  className="p-1 hover:bg-(--puck-color-surface-subtle) rounded"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] mb-1 text-(--puck-color-text-secondary)">
                    Ширина
                  </label>
                  <input
                    type="number"
                    min={320}
                    max={2560}
                    value={tempWidth}
                    onChange={(e) => setTempWidth(e.target.value)}
                    className="w-full p-1.5 text-sm border border-(--puck-color-border) rounded bg-(--puck-color-surface) text-(--puck-color-text)"
                  />
                </div>
                <span className="mt-5 text-(--puck-color-text-muted)">×</span>
                <div className="flex-1">
                  <label className="block text-[11px] mb-1 text-(--puck-color-text-secondary)">
                    Высота
                  </label>
                  <input
                    type="number"
                    min={320}
                    max={2560}
                    value={tempHeight}
                    onChange={(e) => setTempHeight(e.target.value)}
                    className="w-full p-1.5 text-sm border border-(--puck-color-border) rounded bg-(--puck-color-surface) text-(--puck-color-text)"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full mt-3 p-2 text-sm font-medium rounded bg-(--puck-color-interactive) text-white hover:bg-(--puck-color-interactive-hover) transition-colors flex items-center justify-center gap-2"
              >
                <Check size={16} />
                Применить
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            <Puck.Fields />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PuckEditorShell({
  storageKey,
  initial,
  initialSocialOptions = [],
}: {
  storageKey: "puck_header" | "puck_footer" | "puck_home";
  initial: Data;
  initialSocialOptions?: SocialOption[];
}) {
  const router = useRouter();

  const [socialOptions, setSocialOptions] =
    useState<SocialOption[]>(initialSocialOptions);

  const [viewport, setViewport] = useState({ width: 1280, height: 800 });
  const [isCustomPanelOpen, setIsCustomPanelOpen] = useState(false);
  const [tempWidth, setTempWidth] = useState<string>("1280");
  const [tempHeight, setTempHeight] = useState<string>("800");
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("dark");

  const config: Config = useMemo(
    () => createPuckConfig(socialOptions),
    [socialOptions],
  );

  const inflightRef = useRef(false);
  const serializedRef = useRef(JSON.stringify(initialSocialOptions));

  const sync = useCallback(async () => {
    if (inflightRef.current) return;
    inflightRef.current = true;
    try {
      const res = await fetch("/api/settings/social-options", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const next: SocialOption[] = await res.json();
      const serialized = JSON.stringify(next);
      if (serialized === serializedRef.current) return;
      serializedRef.current = serialized;
      setSocialOptions(next);
    } catch {
      /* ignore */
    } finally {
      inflightRef.current = false;
    }
  }, []);

  useEffect(() => {
    void sync();
    const onFocus = () => {
      if (document.visibilityState !== "visible") return;
      void sync();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [sync]);

  const onPublish = useCallback(
    async (data: Data) => {
      try {
        const res = await fetch("/api/admin/puck", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: storageKey, data }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          alert(`Ошибка: ${body.error ?? res.status}`);
          return;
        }
        router.refresh();
        alert("Сохранено");
      } catch (e) {
        console.error(e);
        alert("Сеть недоступна");
      }
    },
    [router, storageKey],
  );

  const handleApplyCustom = () => {
    const w = Number(tempWidth);
    const h = Number(tempHeight);
    if (w >= 320 && w <= 2560 && h >= 320 && h <= 2560) {
      setViewport({ width: w, height: h });
      setIsCustomPanelOpen(false);
    } else {
      alert("Ширина и высота должны быть от 320 до 2560 px");
    }
  };

  const isCustomSize = !BASE_VIEWPORTS.some(
    (v) => v.width === viewport.width && v.height === viewport.height,
  );

  return (
    <div className="puck-theme-wrapper h-full min-h-0 w-full flex flex-col">
      <Puck
        config={config}
        data={initial}
        onPublish={onPublish}
        iframe={{ enabled: true }}
      >
        <InnerPuckShell
          onPublish={onPublish}
          viewport={viewport}
          setViewport={setViewport}
          isCustomPanelOpen={isCustomPanelOpen}
          setIsCustomPanelOpen={setIsCustomPanelOpen}
          tempWidth={tempWidth}
          setTempWidth={setTempWidth}
          tempHeight={tempHeight}
          setTempHeight={setTempHeight}
          handleApplyCustom={handleApplyCustom}
          isCustomSize={isCustomSize}
          previewTheme={previewTheme}
          setPreviewTheme={setPreviewTheme}
        />
      </Puck>
    </div>
  );
}