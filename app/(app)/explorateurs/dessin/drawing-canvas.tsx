"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeStorageFilename } from "@/lib/media/safe-filename";
import { saveDrawing } from "./actions";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;
const BACKGROUND = "#ffffff";
const CHILD_STORAGE_KEY = "family:selected-child";

const COLORS = [
  "#1c2b28",
  "#7a5240",
  "#d94f4f",
  "#e8823a",
  "#e8c93a",
  "#5aa86a",
  "#3a9e9e",
  "#3d6fd9",
  "#8a5bc9",
  "#e06bb0",
  "#9aa0a6",
  "#ffffff",
];

const SIZES = [
  { label: "Fin", value: 4 },
  { label: "Moyen", value: 10 },
  { label: "Épais", value: 20 },
];

type Point = { x: number; y: number };
type Stroke = { color: string; size: number; points: Point[] };

export function DrawingCanvas({ trips }: { trips: { id: string; title: string }[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1].value);
  const [isErasing, setIsErasing] = useState(false);
  const [title, setTitle] = useState("");
  const [tripId, setTripId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeColor = isErasing ? BACKGROUND : color;

  function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
    if (stroke.points.length === 0) return;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (const point of stroke.points.slice(1)) {
      ctx.lineTo(point.x, point.y);
    }
    if (stroke.points.length === 1) {
      ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1);
    }
    ctx.stroke();
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes) {
      drawStroke(ctx, stroke);
    }
  }, [strokes]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    canvasRef.current?.setPointerCapture(e.pointerId);
    const stroke: Stroke = { color: activeColor, size: isErasing ? size * 2 : size, points: [getPoint(e)] };
    setCurrentStroke(stroke);
    setRedoStack([]);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!currentStroke) return;
    const point = getPoint(e);
    const updated = { ...currentStroke, points: [...currentStroke.points, point] };
    setCurrentStroke(updated);

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) drawStroke(ctx, { ...updated, points: updated.points.slice(-2) });
  }

  function handlePointerUp() {
    if (!currentStroke) return;
    setStrokes((prev) => [...prev, currentStroke]);
    setCurrentStroke(null);
  }

  function handleUndo() {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setStrokes(strokes.slice(0, -1));
    setRedoStack((prev) => [...prev, last]);
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setStrokes((prev) => [...prev, next]);
  }

  function handleClear() {
    setStrokes([]);
    setRedoStack([]);
  }

  async function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsSaving(true);
    setError(null);

    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Impossible de générer l'image.");

      const file = new File([blob], "dessin.png", { type: "image/png" });
      const path = safeStorageFilename(file.name);
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage.from("drawings").upload(path, file);
      if (uploadError) throw new Error(uploadError.message);

      const childProfileId = typeof window !== "undefined" ? localStorage.getItem(CHILD_STORAGE_KEY) : null;
      const result = await saveDrawing({
        storagePath: path,
        title: title.trim() || null,
        tripId: tripId || null,
        childProfileId,
      });
      if (result.error) throw new Error(result.error);

      router.push("/explorateurs/dessin/galerie");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4 bg-card border border-border rounded-xl p-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setColor(c);
                setIsErasing(false);
              }}
              aria-label={`Couleur ${c}`}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${!isErasing && color === c ? "scale-110 border-primary" : "border-border"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSize(s.value)}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
                size === s.value ? "bg-primary/15 border-primary" : "border-border hover:bg-primary/5"
              }`}
              aria-label={s.label}
            >
              <span className="rounded-full bg-foreground" style={{ width: s.value * 0.7, height: s.value * 0.7 }} />
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIsErasing((v) => !v)}
          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${isErasing ? "bg-primary/15 border-primary" : "border-border hover:bg-primary/5"}`}
        >
          🧽 Gomme
        </button>

        <div className="flex items-center gap-1.5 ml-auto">
          <button type="button" onClick={handleUndo} disabled={strokes.length === 0} className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-primary/5 disabled:opacity-40">
            ↶ Annuler
          </button>
          <button type="button" onClick={handleRedo} disabled={redoStack.length === 0} className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-primary/5 disabled:opacity-40">
            ↷ Refaire
          </button>
          <button type="button" onClick={handleClear} className="px-3 py-2 rounded-lg border border-border text-sm hover:bg-red-50 hover:text-red-700">
            Effacer tout
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-auto rounded-2xl border border-border shadow-sm touch-none cursor-crosshair bg-white"
      />

      <div className="flex flex-wrap items-end gap-3 bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-xs text-muted">
            Titre (optionnel)
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Le lion du safari"
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        {trips.length > 0 && (
          <div className="flex flex-col gap-1">
            <label htmlFor="trip" className="text-xs text-muted">
              Voyage associé (optionnel)
            </label>
            <select id="trip" value={tripId} onChange={(e) => setTripId(e.target.value)} className="bg-background border border-border rounded-lg px-3 py-2 text-sm">
              <option value="">—</option>
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || strokes.length === 0}
          className="ml-auto rounded-full bg-primary text-primary-foreground text-sm px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? "Sauvegarde…" : "💾 Sauvegarder"}
        </button>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
