"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  Type,
  Square,
  Circle,
  Star,
  Layers,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Save,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Plus,
  Heart,
  Palette,
  Check,
  Move,
  Eye,
  FileDown
} from "lucide-react";

// ==========================================
// INTERFACES & TYPES
// ==========================================

export interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape";
  content: string; // Text string or Image URL or Shape type
  x: number; // Left percentage (0 to 100) inside the printable area
  y: number; // Top percentage (0 to 100) inside the printable area
  width: number; // Width in percentage (relative to printable width)
  height: number; // Height in percentage (relative to printable height)
  rotation: number; // Rotation in degrees (0 - 360)
  zIndex: number; // Layer position

  // Text specific
  fontFamily?: string;
  fontSize?: number; // Base point size
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";

  // Shape specific
  shapeType?: "rect" | "circle" | "star" | "triangle" | "heart";
  fillColor?: string;
}

export type DesignSide = "front" | "back";

interface TShirtDesignerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (previews: { front?: string; back?: string }, editorState: any) => void;
  initialState?: any;
}

const PRESET_COLORS = [
  { name: "Deep Charcoal", hex: "#171717" },
  { name: "Heather Grey", hex: "#7F8C8D" },
  { name: "Crisp White", hex: "#FFFFFF" },
  { name: "Classic Navy", hex: "#171717" },
  { name: "Royal Blue", hex: "#B87D4C" },
  { name: "Crimson Red", hex: "#991B1B" },
  { name: "Forest Green", hex: "#065F46" },
  { name: "Pastel Pink", hex: "#FBCFE8" },
  { name: "Mustard Yellow", hex: "#CBAA75" }
];

const FONTS = [
  "Inter",
  "Outfit",
  "Roboto",
  "Playfair Display",
  "Impact",
  "Comic Sans MS",
  "Georgia",
  "Courier New"
];

// ==========================================
// DETAILED SVG MOCKUPS
// ==========================================

const TShirtSVG = ({ color, side }: { color: string; side: DesignSide }) => {
  const isDark = color.toLowerCase() === "#171717" || color.toLowerCase() === "#171717" || color.toLowerCase() === "#B87D4C" || color.toLowerCase() === "#991b1b" || color.toLowerCase() === "#065f46";
  const innerNeckColor = isDark ? "#171717" : "#E8E6E3";

  return (
    <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.5)]">
      <defs>
        {/* Soft realistic contours and shading */}
        <radialGradient id="shirt-glow" cx="50%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={isDark ? "0.08" : "0.2"} />
          <stop offset="60%" stopColor="#171717" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#171717" stopOpacity={isDark ? "0.45" : "0.22"} />
        </radialGradient>
        {/* Sleeve shading left */}
        <linearGradient id="sleeve-fold-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#171717" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>
        {/* Sleeve shading right */}
        <linearGradient id="sleeve-fold-right" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#171717" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Main Shirt Body Shape */}
      <path
        d="M 150 50 
           Q 250 78 350 50 
           L 465 115 
           Q 485 145 445 185 
           L 412 165 
           L 405 450 
           Q 250 472 95 450 
           L 88 165 
           L 55 185 
           Q 15 145 35 115 
           Z"
        fill={color}
        className="transition-colors duration-500 ease-out"
      />

      {/* Realistic Shadow Overlay */}
      <path
        d="M 150 50 Q 250 78 350 50 L 465 115 Q 485 145 445 185 L 412 165 L 405 450 Q 250 472 95 450 L 88 165 L 55 185 Q 15 145 35 115 Z"
        fill="url(#shirt-glow)"
        style={{ mixBlendMode: "multiply" }}
      />

      {side === "front" ? (
        <>
          {/* Inner Back Neck (Visible from front crew neck) */}
          <path
            d="M 180 57 Q 250 82 320 57 C 310 77 280 92 250 92 C 220 92 190 77 180 57 Z"
            fill={innerNeckColor}
          />
          {/* Collar Band / Ribbing */}
          <path
            d="M 180 57 Q 250 82 320 57 Q 250 87 180 57 Z"
            fill="none"
            stroke={isDark ? "#3A3A3A" : "#E8E6E3"}
            strokeWidth="3.5"
            opacity="0.6"
          />
          {/* Subtle Neck tag simulation */}
          <rect x="238" y="68" width="24" height="15" rx="2" fill="#555" opacity="0.4" />
        </>
      ) : (
        <>
          {/* Back Collar Line (Higher, crew back) */}
          <path
            d="M 180 57 Q 250 67 320 57"
            fill="none"
            stroke={isDark ? "#171717" : "#E8E6E3"}
            strokeWidth="5"
            opacity="0.8"
          />
          {/* Shoulder Blade contour folds */}
          <path d="M 190 85 Q 250 110 310 85" fill="none" stroke="#171717" strokeWidth="1.5" opacity="0.12" />
        </>
      )}

      {/* Sleeve Seams */}
      <path d="M 135 117 L 152 190" stroke="#171717" strokeWidth="1.5" opacity="0.15" fill="none" />
      <path d="M 365 117 L 348 190" stroke="#171717" strokeWidth="1.5" opacity="0.15" fill="none" />

      {/* Armpit seam highlights */}
      <path d="M 135 117 Q 95 140 88 165" fill="none" stroke="url(#sleeve-fold-left)" strokeWidth="3" opacity="0.5" />
      <path d="M 365 117 Q 405 140 412 165" fill="none" stroke="url(#sleeve-fold-right)" strokeWidth="3" opacity="0.5" />

      {/* Subtle creases / fabric folds for photorealism */}
      <path d="M 110 380 Q 180 395 240 375" fill="none" stroke="#ffffff" strokeWidth="1" opacity={isDark ? "0.06" : "0.15"} />
      <path d="M 390 390 Q 320 405 260 385" fill="none" stroke="#171717" strokeWidth="1" opacity="0.1" />
      <path d="M 160 210 Q 250 225 340 210" fill="none" stroke="#171717" strokeWidth="1.2" opacity="0.08" />
    </svg>
  );
};

// ==========================================
// PREVIEW CARD VIEW
// ==========================================

const TShirtPreviewCard = ({
  color,
  side,
  elementsList,
  size = "large"
}: {
  color: string;
  side: DesignSide;
  elementsList: CanvasElement[];
  size?: "small" | "large";
}) => {
  return (
    <div className={`relative ${size === "small" ? "w-full max-w-[280px]" : "w-full max-w-[420px]"} aspect-square flex items-center justify-center select-none bg-neutral-900/35 rounded-2xl p-4 border border-neutral-800/50 shadow-xl overflow-hidden`}>
      {/* Backdrop T-Shirt Visual */}
      <TShirtSVG color={color} side={side} />

      {/* PRINTABLE AREA (HIDDEN/BORDERLESS IN PREVIEW) */}
      <div className="absolute left-[32%] top-[25%] w-[36%] h-[46%] z-40 overflow-hidden pointer-events-none">
        {elementsList.map((el) => (
          <div
            key={el.id}
            style={{
              position: "absolute",
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.width}%`,
              height: `${el.height}%`,
              transform: `rotate(${el.rotation}deg)`,
              zIndex: el.zIndex
            }}
            className="flex items-center justify-center w-full h-full"
          >
            {el.type === "image" && (
              <img
                src={el.content}
                className="w-full h-full object-contain select-none pointer-events-none"
                alt="preview element"
              />
            )}

            {el.type === "text" && (
              <div
                style={{
                  fontFamily: el.fontFamily,
                  color: el.color,
                  fontWeight: el.bold ? "bold" : "normal",
                  fontStyle: el.italic ? "italic" : "normal",
                  textDecoration: el.underline ? "underline" : "none",
                  textAlign: el.align || "center",
                  fontSize: "14px", // Matches interactive design container scaling
                  width: "100%"
                }}
                className="select-none pointer-events-none break-words leading-tight"
              >
                {el.content}
              </div>
            )}

            {el.type === "shape" && (
              <div className="w-full h-full pointer-events-none select-none">
                {el.shapeType === "rect" && <div className="w-full h-full" style={{ backgroundColor: el.fillColor }} />}
                {el.shapeType === "circle" && <div className="w-full h-full rounded-full" style={{ backgroundColor: el.fillColor }} />}
                {el.shapeType === "triangle" && (
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <polygon points="50,5 95,95 5,95" fill={el.fillColor} />
                  </svg>
                )}
                {el.shapeType === "star" && (
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={el.fillColor} />
                  </svg>
                )}
                {el.shapeType === "heart" && (
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={el.fillColor} />
                  </svg>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TShirtDesigner({
  isOpen,
  onClose,
  onSave,
  initialState
}: TShirtDesignerProps) {
  // ==========================================
  // COMPONENT STATE
  // ==========================================
  const [designerSide, setDesignerSide] = useState<"front" | "back" | "both">("both");
  const [showSelector, setShowSelector] = useState(true);
  const [currentSide, setCurrentSide] = useState<DesignSide>("front");
  const [activeTab, setActiveTab] = useState<"upload" | "text" | "shapes" | "layers">("upload");

  // Element arrays per side
  const [elements, setElements] = useState<{ front: CanvasElement[]; back: CanvasElement[] }>({
    front: [],
    back: []
  });

  // Selected Element ID
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Undo/Redo Stacks
  const [history, setHistory] = useState<{
    front: CanvasElement[][];
    back: CanvasElement[][];
  }>({ front: [[]], back: [[]] });
  const [historyIndex, setHistoryIndex] = useState<{ front: number; back: number }>({ front: 0, back: 0 });

  // Canvas View State
  const [tshirtColor, setTshirtColor] = useState("#171717");
  const [zoom, setZoom] = useState(1);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewSide, setPreviewSide] = useState<"front" | "back" | "both">("both");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [confirmPreviews, setConfirmPreviews] = useState<{ front?: string; back?: string }>({});
  const [inspectSide, setInspectSide] = useState<DesignSide>("front");

  // References
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Touch/Mouse Dragging and Transformations State
  const interactionRef = useRef<{
    elementId: string;
    type: "drag" | "resize" | "rotate";
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
    initialRotation: number;
  } | null>(null);

  // ==========================================
  // INITIAL LOAD
  // ==========================================
  useEffect(() => {
    if (initialState) {
      if (initialState.elements) setElements(initialState.elements);
      if (initialState.color) setTshirtColor(initialState.color);
      if (initialState.designerSide) {
        setDesignerSide(initialState.designerSide);
        setCurrentSide(initialState.designerSide === "back" ? "back" : "front");
        setShowSelector(false);
      }
    }
  }, [initialState, isOpen]);

  // ==========================================
  // HISTORY MANAGEMENT
  // ==========================================
  const pushToHistory = (newElements: CanvasElement[], side: DesignSide) => {
    const sideHistory = history[side].slice(0, historyIndex[side] + 1);

    setHistory((prev) => ({
      ...prev,
      [side]: [...sideHistory, newElements]
    }));

    setHistoryIndex((prev) => ({
      ...prev,
      [side]: sideHistory.length
    }));
  };

  const updateElementsAndHistory = (newElements: CanvasElement[], side: DesignSide = currentSide) => {
    setElements((prev) => ({
      ...prev,
      [side]: newElements
    }));
    pushToHistory(newElements, side);
  };

  const handleUndo = () => {
    const side = currentSide;
    const currIdx = historyIndex[side];
    if (currIdx > 0) {
      const prevIdx = currIdx - 1;
      setHistoryIndex((prev) => ({ ...prev, [side]: prevIdx }));
      setElements((prev) => ({
        ...prev,
        [side]: history[side][prevIdx]
      }));
      setSelectedElementId(null);
    }
  };

  const handleRedo = () => {
    const side = currentSide;
    const currIdx = historyIndex[side];
    if (currIdx < history[side].length - 1) {
      const nextIdx = currIdx + 1;
      setHistoryIndex((prev) => ({ ...prev, [side]: nextIdx }));
      setElements((prev) => ({
        ...prev,
        [side]: history[side][nextIdx]
      }));
      setSelectedElementId(null);
    }
  };

  // ==========================================
  // CORE ELEMENT CRUD
  // ==========================================
  const addElement = (element: Omit<CanvasElement, "id" | "zIndex" | "x" | "y" | "rotation">) => {
    const sideElements = elements[currentSide];
    const maxZ = sideElements.reduce((max, el) => Math.max(max, el.zIndex), 0);

    const newEl: CanvasElement = {
      ...element,
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      x: 35, // Centered percentages
      y: 35,
      rotation: 0,
      zIndex: maxZ + 1
    };

    const newElementsList = [...sideElements, newEl];
    updateElementsAndHistory(newElementsList);
    setSelectedElementId(newEl.id);
  };

  const deleteElement = (id: string | null = selectedElementId) => {
    if (!id) return;
    const sideElements = elements[currentSide];
    const newElementsList = sideElements.filter((el) => el.id !== id);
    updateElementsAndHistory(newElementsList);
    setSelectedElementId(null);
  };

  const duplicateElement = (id: string | null = selectedElementId) => {
    if (!id) return;
    const sideElements = elements[currentSide];
    const target = sideElements.find((el) => el.id === id);
    if (!target) return;

    const maxZ = sideElements.reduce((max, el) => Math.max(max, el.zIndex), 0);
    const duplicated: CanvasElement = {
      ...target,
      id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      x: Math.min(target.x + 5, 80), // offset slightly
      y: Math.min(target.y + 5, 80),
      zIndex: maxZ + 1
    };

    const newElementsList = [...sideElements, duplicated];
    updateElementsAndHistory(newElementsList);
    setSelectedElementId(duplicated.id);
  };

  const changeLayerOrder = (direction: "forward" | "backward", id: string | null = selectedElementId) => {
    if (!id) return;
    const sideElements = [...elements[currentSide]];
    const index = sideElements.findIndex((el) => el.id === id);
    if (index === -1) return;

    // Sort by zIndex first to ensure index sequence matching
    sideElements.sort((a, b) => a.zIndex - b.zIndex);
    const targetIdx = sideElements.findIndex((el) => el.id === id);

    if (direction === "forward" && targetIdx < sideElements.length - 1) {
      // Swap zIndex with next
      const tempZ = sideElements[targetIdx].zIndex;
      sideElements[targetIdx].zIndex = sideElements[targetIdx + 1].zIndex;
      sideElements[targetIdx + 1].zIndex = tempZ;
    } else if (direction === "backward" && targetIdx > 0) {
      // Swap zIndex with prev
      const tempZ = sideElements[targetIdx].zIndex;
      sideElements[targetIdx].zIndex = sideElements[targetIdx - 1].zIndex;
      sideElements[targetIdx - 1].zIndex = tempZ;
    }

    updateElementsAndHistory(sideElements);
  };

  const updateElementProperties = (id: string, props: Partial<CanvasElement>) => {
    const sideElements = elements[currentSide];
    const updated = sideElements.map((el) => {
      if (el.id === id) {
        return { ...el, ...props };
      }
      return el;
    });
    updateElementsAndHistory(updated);
  };

  // ==========================================
  // TEXT CREATION
  // ==========================================
  const handleAddText = () => {
    addElement({
      type: "text",
      content: "Customize Me",
      width: 40,
      height: 12,
      fontFamily: "Outfit",
      fontSize: 24,
      color: "#FFFFFF",
      bold: true,
      italic: false,
      underline: false,
      align: "center"
    });
  };

  // ==========================================
  // IMAGE CREATION / UPLOAD
  // ==========================================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let files: File[] = [];
    if ("files" in e.target && e.target.files) {
      files = Array.from(e.target.files);
    } else if ("dataTransfer" in e && e.dataTransfer.files) {
      files = Array.from(e.dataTransfer.files);
    }

    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);

      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const width = 35;
        const height = width / aspect;
        addElement({
          type: "image",
          content: url,
          width,
          height: Math.min(height, 50)
        });
      };
      img.src = url;
    });
  };

  // ==========================================
  // SHAPE CREATION
  // ==========================================
  const handleAddShape = (shapeType: "rect" | "circle" | "star" | "triangle" | "heart") => {
    addElement({
      type: "shape",
      content: shapeType,
      width: 25,
      height: 25,
      shapeType,
      fillColor: "#B87D4C"
    });
  };

  // ==========================================
  // CANVAS GESTURE GIANTS (DRAG, RESIZE, ROTATE)
  // ==========================================
  const handleInteractionStart = (
    e: React.MouseEvent | React.TouchEvent,
    element: CanvasElement,
    type: "drag" | "resize" | "rotate",
    handle?: string
  ) => {
    e.stopPropagation();
    setSelectedElementId(element.id);

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    interactionRef.current = {
      elementId: element.id,
      type,
      startX: clientX,
      startY: clientY,
      initialX: element.x,
      initialY: element.y,
      initialWidth: element.width,
      initialHeight: element.height,
      initialRotation: element.rotation
    };

    document.addEventListener("mousemove", handleInteractionMove);
    document.addEventListener("mouseup", handleInteractionEnd);
    document.addEventListener("touchmove", handleInteractionMove, { passive: false });
    document.addEventListener("touchend", handleInteractionEnd);
  };

  const handleInteractionMove = (e: MouseEvent | TouchEvent) => {
    if (!interactionRef.current) return;
    const inter = interactionRef.current;

    // Prevent scroll on mobile drag
    if (e.cancelable) e.preventDefault();

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const printableArea = canvasRef.current?.getBoundingClientRect();
    if (!printableArea) return;

    const deltaX = ((clientX - inter.startX) / printableArea.width) * 100 * (1 / zoom);
    const deltaY = ((clientY - inter.startY) / printableArea.height) * 100 * (1 / zoom);

    const sideElements = elements[currentSide];
    const target = sideElements.find((el) => el.id === inter.elementId);
    if (!target) return;

    if (inter.type === "drag") {
      // Calculate boundaries safely (0-100)
      const newX = Math.max(0, Math.min(100 - target.width, inter.initialX + deltaX));
      const newY = Math.max(0, Math.min(100 - target.height, inter.initialY + deltaY));

      setElements((prev) => ({
        ...prev,
        [currentSide]: prev[currentSide].map((el) =>
          el.id === target.id ? { ...el, x: newX, y: newY } : el
        )
      }));
    } else if (inter.type === "resize") {
      // Scale calculation relative to element center for smooth multi-angle scaling
      const elDom = document.getElementById(`dom_${target.id}`);
      if (!elDom) return;
      const elRect = elDom.getBoundingClientRect();
      const cx = elRect.left + elRect.width / 2;
      const cy = elRect.top + elRect.height / 2;

      const d1 = Math.hypot(inter.startX - cx, inter.startY - cy);
      const d2 = Math.hypot(clientX - cx, clientY - cy);
      const scale = d2 / d1;

      // New dimensional calculations
      const newWidth = Math.max(5, Math.min(95, inter.initialWidth * scale));
      const newHeight = Math.max(5, Math.min(95, inter.initialHeight * scale));

      // Calculate centering offset so element scales from center
      const diffW = newWidth - inter.initialWidth;
      const diffH = newHeight - inter.initialHeight;
      const newX = Math.max(0, Math.min(100 - newWidth, inter.initialX - diffW / 2));
      const newY = Math.max(0, Math.min(100 - newHeight, inter.initialY - diffH / 2));

      setElements((prev) => ({
        ...prev,
        [currentSide]: prev[currentSide].map((el) =>
          el.id === target.id ? { ...el, width: newWidth, height: newHeight, x: newX, y: newY } : el
        )
      }));
    } else if (inter.type === "rotate") {
      const elDom = document.getElementById(`dom_${target.id}`);
      if (!elDom) return;
      const elRect = elDom.getBoundingClientRect();
      const cx = elRect.left + elRect.width / 2;
      const cy = elRect.top + elRect.height / 2;

      // Calculate angle from center to pointer
      const angleRad = Math.atan2(clientY - cy, clientX - cx);
      let angleDeg = angleRad * (180 / Math.PI) + 90; // Handle top handle offsets
      if (angleDeg < 0) angleDeg += 360;

      setElements((prev) => ({
        ...prev,
        [currentSide]: prev[currentSide].map((el) =>
          el.id === target.id ? { ...el, rotation: Math.round(angleDeg) } : el
        )
      }));
    }
  };

  const handleInteractionEnd = () => {
    if (interactionRef.current) {
      const inter = interactionRef.current;
      // Commit final values into react history
      const updatedElements = elements[currentSide];
      pushToHistory(updatedElements, currentSide);
      interactionRef.current = null;
    }
    document.removeEventListener("mousemove", handleInteractionMove);
    document.removeEventListener("mouseup", handleInteractionEnd);
    document.removeEventListener("touchmove", handleInteractionMove);
    document.removeEventListener("touchend", handleInteractionEnd);
  };

  // ==========================================
  // CANVAS PREVIEW RENDERING & EXPORTS
  // ==========================================
  const renderCanvasToDataURL = async (side: DesignSide): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve("");

      // Render realistic T-shirt visual with contours, gradients, and shading onto a transparent canvas
      const isDark = tshirtColor.toLowerCase() === "#171717" || tshirtColor.toLowerCase() === "#171717" || tshirtColor.toLowerCase() === "#B87D4C" || tshirtColor.toLowerCase() === "#991b1b" || tshirtColor.toLowerCase() === "#065f46";
      const innerNeckColor = isDark ? "#171717" : "#E8E6E3";

      const svgString = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="1024" height="1024">
          <defs>
            <!-- Soft realistic contours and shading -->
            <radialGradient id="shirt-glow" cx="50%" cy="30%" r="65%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="${isDark ? "0.08" : "0.2"}" />
              <stop offset="60%" stop-color="#171717" stop-opacity="0.08" />
              <stop offset="100%" stop-color="#171717" stop-opacity="${isDark ? "0.45" : "0.22"}" />
            </radialGradient>
            <!-- Sleeve shading left -->
            <linearGradient id="sleeve-fold-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#171717" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
            </linearGradient>
            <!-- Sleeve shading right -->
            <linearGradient id="sleeve-fold-right" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#171717" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Main Shirt Body Shape -->
          <path
            d="M 150 50 Q 250 78 350 50 L 465 115 Q 485 145 445 185 L 412 165 L 405 450 Q 250 472 95 450 L 88 165 L 55 185 Q 15 145 35 115 Z"
            fill="${tshirtColor}"
          />

          <!-- Realistic Shadow Overlay -->
          <path
            d="M 150 50 Q 250 78 350 50 L 465 115 Q 485 145 445 185 L 412 165 L 405 450 Q 250 472 95 450 L 88 165 L 55 185 Q 15 145 35 115 Z"
            fill="url(#shirt-glow)"
            style="mix-blend-mode: multiply;"
          />

          ${side === "front" ? `
            <!-- Inner Back Neck (Visible from front crew neck) -->
            <path
              d="M 180 57 Q 250 82 320 57 C 310 77 280 92 250 92 C 220 92 190 77 180 57 Z"
              fill="${innerNeckColor}"
            />
            <!-- Collar Band / Ribbing -->
            <path
              d="M 180 57 Q 250 82 320 57 Q 250 87 180 57 Z"
              fill="none"
              stroke="${isDark ? "#3A3A3A" : "#E8E6E3"}"
              stroke-width="3.5"
              opacity="0.6"
            />
            <!-- Subtle Neck tag simulation -->
            <rect x="238" y="68" width="24" height="15" rx="2" fill="#555" opacity="0.4" />
          ` : `
            <!-- Back Collar Line (Higher, crew back) -->
            <path
              d="M 180 57 Q 250 67 320 57"
              fill="none"
              stroke="${isDark ? "#171717" : "#E8E6E3"}"
              stroke-width="5"
              opacity="0.8"
            />
            <!-- Shoulder Blade contour folds -->
            <path d="M 190 85 Q 250 110 310 85" fill="none" stroke="#171717" stroke-width="1.5" opacity="0.12" />
          `}

          <!-- Sleeve Seams -->
          <path d="M 135 117 L 152 190" stroke="#171717" stroke-width="1.5" opacity="0.15" fill="none" />
          <path d="M 365 117 L 348 190" stroke="#171717" stroke-width="1.5" opacity="0.15" fill="none" />

          <!-- Armpit seam highlights -->
          <path d="M 135 117 Q 95 140 88 165" fill="none" stroke="url(#sleeve-fold-left)" stroke-width="3" opacity="0.5" />
          <path d="M 365 117 Q 405 140 412 165" fill="none" stroke="url(#sleeve-fold-right)" stroke-width="3" opacity="0.5" />

          <!-- Subtle creases / fabric folds for photorealism -->
          <path d="M 110 380 Q 180 395 240 375" fill="none" stroke="#ffffff" stroke-width="1" opacity="${isDark ? "0.06" : "0.15"}" />
          <path d="M 390 390 Q 320 405 260 385" fill="none" stroke="#171717" stroke-width="1" opacity="0.1" />
          <path d="M 160 210 Q 250 225 340 210" fill="none" stroke="#171717" stroke-width="1.2" opacity="0.08" />
        </svg>
      `;

      const tShirtImg = new Image();
      tShirtImg.onload = async () => {
        // Draw the main T-shirt shape
        ctx.drawImage(tShirtImg, 0, 0, 1024, 1024);

        // Printable area bounds on 1024 canvas
        // Matches the CSS boundaries: left 32%, top 25%, width 36%, height 46%
        const px = 1024 * 0.32;
        const py = 1024 * 0.25;
        const pw = 1024 * 0.36;
        const ph = 1024 * 0.46;

        // Draw elements sorted by zIndex
        const sorted = [...elements[side]].sort((a, b) => a.zIndex - b.zIndex);

        for (const el of sorted) {
          ctx.save();

          // Element absolute properties
          const elX = px + (el.x / 100) * pw;
          const elY = py + (el.y / 100) * ph;
          const elW = (el.width / 100) * pw;
          const elH = (el.height / 100) * ph;

          // Pivot and rotate canvas
          ctx.translate(elX + elW / 2, elY + elH / 2);
          ctx.rotate((el.rotation * Math.PI) / 180);

          if (el.type === "image") {
            // Draw custom image layers
            await new Promise<void>((imgResolve) => {
              const layerImg = new Image();
              layerImg.crossOrigin = "anonymous";
              layerImg.onload = () => {
                ctx.drawImage(layerImg, -elW / 2, -elH / 2, elW, elH);
                imgResolve();
              };
              layerImg.onerror = () => imgResolve(); // fallback
              layerImg.src = el.content;
            });
          } else if (el.type === "text") {
            // Text typography options
            const fStyle = `${el.italic ? "italic " : ""}${el.bold ? "bold " : ""}`;
            const fSize = (el.fontSize || 24) * 2; // high resolution scale
            const fFamily = el.fontFamily || "Outfit";
            ctx.font = `${fStyle}${fSize}px ${fFamily}`;
            ctx.fillStyle = el.color || "#FFFFFF";
            ctx.textAlign = el.align || "center";
            ctx.textBaseline = "middle";

            const textX = el.align === "left" ? -elW / 2 : el.align === "right" ? elW / 2 : 0;
            ctx.fillText(el.content, textX, 0);

            if (el.underline) {
              const metrics = ctx.measureText(el.content);
              const textWidth = metrics.width;
              ctx.lineWidth = fSize / 12;
              ctx.strokeStyle = el.color || "#FFFFFF";
              ctx.beginPath();
              const lineY = fSize / 2;
              if (el.align === "center") {
                ctx.moveTo(-textWidth / 2, lineY);
                ctx.lineTo(textWidth / 2, lineY);
              } else if (el.align === "left") {
                ctx.moveTo(-elW / 2, lineY);
                ctx.lineTo(-elW / 2 + textWidth, lineY);
              } else {
                ctx.moveTo(elW / 2 - textWidth, lineY);
                ctx.lineTo(elW / 2, lineY);
              }
              ctx.stroke();
            }
          } else if (el.type === "shape") {
            ctx.fillStyle = el.fillColor || "#B87D4C";
            if (el.shapeType === "rect") {
              ctx.fillRect(-elW / 2, -elH / 2, elW, elH);
            } else if (el.shapeType === "circle") {
              ctx.beginPath();
              ctx.arc(0, 0, Math.min(elW, elH) / 2, 0, Math.PI * 2);
              ctx.fill();
            } else if (el.shapeType === "triangle") {
              ctx.beginPath();
              ctx.moveTo(0, -elH / 2);
              ctx.lineTo(elW / 2, elH / 2);
              ctx.lineTo(-elW / 2, elH / 2);
              ctx.closePath();
              ctx.fill();
            } else if (el.shapeType === "heart") {
              ctx.beginPath();
              const topY = -elH / 2;
              ctx.moveTo(0, topY + elH * 0.3);
              ctx.bezierCurveTo(-elW * 0.4, topY - elH * 0.1, -elW * 0.6, topY + elH * 0.4, 0, elH / 2);
              ctx.bezierCurveTo(elW * 0.6, topY + elH * 0.4, elW * 0.4, topY - elH * 0.1, 0, topY + elH * 0.3);
              ctx.closePath();
              ctx.fill();
            } else if (el.shapeType === "star") {
              ctx.beginPath();
              const spikes = 5;
              const outerRadius = elW / 2;
              const innerRadius = elW / 4;
              let rot = (Math.PI / 2) * 3;
              let x = 0;
              let y = 0;
              const step = Math.PI / spikes;

              ctx.moveTo(0, -outerRadius);
              for (let i = 0; i < spikes; i++) {
                x = Math.cos(rot) * outerRadius;
                y = Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = Math.cos(rot) * innerRadius;
                y = Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
              }
              ctx.lineTo(0, -outerRadius);
              ctx.closePath();
              ctx.fill();
            }
          }

          ctx.restore();
        }

        resolve(canvas.toDataURL("image/png"));
      };

      tShirtImg.src = "data:image/svg+xml;base64," + btoa(svgString.trim());
    });
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF("p", "mm", "a4");

      // Colors
      const orangeColor = "#B87D4C";
      const slate900 = "#171717";

      // 1. BRANDING HEADER
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(0, 0, 210, 38, "F");

      // Vibrant Accent brand border
      doc.setFillColor(255, 107, 0); // #B87D4C
      doc.rect(0, 35, 210, 3, "F");

      // Brand Title
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("KT ADHESIVE CUSTOM STUDIO", 15, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(194, 65, 12); // Orange-700 tint for tech pack accent
      doc.text("PREMIUM APPAREL TECHNICAL SPECIFICATION PACK", 15, 26);

      // Tech grid decorative dots
      doc.setFillColor(255, 107, 0);
      for (let i = 0; i < 5; i++) {
        doc.circle(185 + i * 4, 15, 0.8, "F");
      }

      // 2. METADATA SECTION
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("DESIGN SPECIFICATIONS", 15, 47);

      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.4);
      doc.line(15, 49, 195, 49);

      const colorName = PRESET_COLORS.find(c => c.hex.toLowerCase() === tshirtColor.toLowerCase())?.name || tshirtColor;
      const todayStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      // Spec Badges (2x2 Grid of Rounded Rectangles)
      doc.setDrawColor(226, 232, 240); // Slate 200 border
      doc.setFillColor(248, 250, 252); // Slate 50 background

      // Badge 1: Fabric Color
      doc.roundedRect(15, 53, 85, 13, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text("FABRIC BASE COLOR", 18, 57.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text(`${colorName} (${tshirtColor.toUpperCase()})`, 18, 62.5);

      // Badge 2: Designer configuration
      doc.setFillColor(15, 23, 42); // Dark slate background for premium high contrast
      doc.roundedRect(110, 53, 85, 13, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(203, 213, 225); // Slate 300 light gray label
      doc.text("WORKSPACE DESIGN CONFIG", 113, 57.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255); // Crisp White data
      const printSuiteLabel = designerSide === "both" ? "Front & Back Customization" : designerSide === "back" ? "Back Face Only Customization" : "Front Face Only Customization";
      doc.text(printSuiteLabel, 113, 62.5);

      // Badge 3: Date
      doc.setFillColor(15, 23, 42); // Dark slate background for premium high contrast
      doc.roundedRect(15, 70, 85, 13, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(203, 213, 225); // Slate 300 light gray label
      doc.text("DATE GENERATED", 18, 74.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255); // Crisp White data
      doc.text(todayStr, 18, 79.5);

      // Badge 4: Approval Status
      doc.setFillColor(248, 250, 252); // Reset to light slate background
      doc.roundedRect(110, 70, 85, 13, 1, 1, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text("SPECIFICATION BLUEPRINT STATUS", 113, 74.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(234, 88, 12); // Orange 600
      doc.text("APPROVED PRODUCTION MOCKUP", 113, 79.5);

      // 3. MOCKUP PREVIEW RENDERING
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("VISUAL REPRESENTATION MOCKUPS", 15, 93);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 95, 195, 95);

      const hasFront = elements.front.length > 0 || designerSide === "front" || designerSide === "both";
      const hasBack = elements.back.length > 0 || designerSide === "back" || designerSide === "both";

      let finalMockupHeight = 90;
      let visualEndY = 191;

      if (hasFront && hasBack) {
        // Front Card
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(15, 99, 85, 86, 2, 2, "FD");

        // Capped Slate title banner
        doc.setFillColor(15, 23, 42);
        doc.rect(15, 99, 85, 6, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text("FRONT SPECIFICATION VIEW", 19, 103.2);

        const frontUrl = await renderCanvasToDataURL("front");
        doc.addImage(frontUrl, "PNG", 16, 105, 83, 78);

        // Technical blueprint overlay for FRONT printable area
        // Box bounds calculated: x = 16 + (83 * 0.32), y = 105 + (78 * 0.25)
        const fx = 16 + (83 * 0.32);
        const fy = 105 + (78 * 0.25);
        const fw = 83 * 0.36;
        const fh = 78 * 0.46;

        doc.setDrawColor(234, 88, 12); // orange-600
        doc.setLineWidth(0.2);
        if (typeof doc.setLineDashPattern === "function") {
          doc.setLineDashPattern([2, 1.5], 0);
        }
        doc.rect(fx, fy, fw, fh, "D");

        // Print area label
        doc.setTextColor(234, 88, 12);
        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.text("PRINT ZONE (36% x 46%)", fx + 1, fy - 1);
        if (typeof doc.setLineDashPattern === "function") {
          doc.setLineDashPattern([], 0);
        }

        // Back Card
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(110, 99, 85, 86, 2, 2, "FD");

        doc.setFillColor(15, 23, 42);
        doc.rect(110, 99, 85, 6, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text("BACK SPECIFICATION VIEW", 114, 103.2);

        const backUrl = await renderCanvasToDataURL("back");
        doc.addImage(backUrl, "PNG", 111, 105, 83, 78);

        // Technical blueprint overlay for BACK printable area
        const bx = 111 + (83 * 0.32);
        const by = 105 + (78 * 0.25);

        doc.setDrawColor(234, 88, 12);
        doc.setLineWidth(0.2);
        if (typeof doc.setLineDashPattern === "function") {
          doc.setLineDashPattern([2, 1.5], 0);
        }
        doc.rect(bx, by, fw, fh, "D");

        // Print area label
        doc.setTextColor(234, 88, 12);
        doc.setFontSize(6);
        doc.text("PRINT ZONE (36% x 46%)", bx + 1, by - 1);
        if (typeof doc.setLineDashPattern === "function") {
          doc.setLineDashPattern([], 0);
        }

        visualEndY = 185;
      } else {
        const activeSide: DesignSide = hasFront ? "front" : "back";

        // Single central large studio frame
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(45, 99, 120, 96, 2, 2, "FD");

        doc.setFillColor(15, 23, 42);
        doc.rect(45, 99, 120, 6, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.text(activeSide === "front" ? "CHEST AREA FRONT VIEW SPEC" : "REAR BLADE BACK VIEW SPEC", 49, 103.2);

        const mockupUrl = await renderCanvasToDataURL(activeSide);
        doc.addImage(mockupUrl, "PNG", 55, 105, 100, 88);

        // Technical printable area overlay for single layout
        const sx = 55 + (100 * 0.32);
        const sy = 105 + (88 * 0.25);
        const sw = 100 * 0.36;
        const sh = 88 * 0.46;

        doc.setDrawColor(234, 88, 12);
        doc.setLineWidth(0.2);
        if (typeof doc.setLineDashPattern === "function") {
          doc.setLineDashPattern([2, 1.5], 0);
        }
        doc.rect(sx, sy, sw, sh, "D");

        doc.setTextColor(234, 88, 12);
        doc.setFontSize(6);
        doc.setFont("helvetica", "bold");
        doc.text("PRINT ZONE (36% x 46%)", sx + 1.5, sy - 1.2);
        if (typeof doc.setLineDashPattern === "function") {
          doc.setLineDashPattern([], 0);
        }

        visualEndY = 195;
      }

      // 4. PRINT ASSETS INVENTORY (ALL CUSTOM LAYERS IN TECHNICAL TABLE)
      const tableY = visualEndY + 10;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text("PRINT ASSETS SPECIFICATIONS INVENTORY", 15, tableY);
      doc.setDrawColor(226, 232, 240);
      doc.line(15, tableY + 2, 195, tableY + 2);

      // Collect assets from both sides
      const allElements: { side: string; type: string; specs: string }[] = [];

      elements.front.forEach((el, index) => {
        let specs = "";
        if (el.type === "text") {
          specs = `Content: "${el.content}" | Font: ${el.fontFamily || "Outfit"} | Color: ${el.color} | Size: ${el.fontSize || 24}pt`;
        } else if (el.type === "shape") {
          specs = `Shape: ${el.shapeType?.toUpperCase()} | Color: ${el.fillColor}`;
        } else if (el.type === "image") {
          specs = `Logo Image Layer [Custom uploaded bitmap graphic]`;
        }
        allElements.push({ side: "FRONT (CHEST)", type: el.type.toUpperCase(), specs });
      });

      elements.back.forEach((el, index) => {
        let specs = "";
        if (el.type === "text") {
          specs = `Content: "${el.content}" | Font: ${el.fontFamily || "Outfit"} | Color: ${el.color} | Size: ${el.fontSize || 24}pt`;
        } else if (el.type === "shape") {
          specs = `Shape: ${el.shapeType?.toUpperCase()} | Color: ${el.fillColor}`;
        } else if (el.type === "image") {
          specs = `Artwork Image Layer [Custom uploaded bitmap graphic]`;
        }
        allElements.push({ side: "BACK (REAR)", type: el.type.toUpperCase(), specs });
      });

      // Render Technical Spec Table
      const headerRowY = tableY + 4;
      doc.setFillColor(15, 23, 42); // Slate 900
      doc.rect(15, headerRowY, 180, 7, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("GARMENT SIDE", 18, headerRowY + 4.8);
      doc.text("ELEMENT TYPE", 53, headerRowY + 4.8);
      doc.text("TECHNICAL SPECIFICATIONS / ATRIBUTES SUMMARY", 88, headerRowY + 4.8);

      if (allElements.length === 0) {
        // Empty state row
        const rowY = headerRowY + 7;
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.rect(15, rowY, 180, 8, "FD");

        doc.setTextColor(100, 116, 139); // Slate 500
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.text("Standard blank fabric configuration - no custom graphics or typography layers added.", 20, rowY + 5.2);
      } else {
        // Render up to 5 elements cleanly
        let rowY = headerRowY + 7;
        doc.setFontSize(8);

        allElements.slice(0, 5).forEach((item, index) => {
          // Zebra striping
          doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
          doc.setDrawColor(241, 245, 249); // slate-100 borders
          doc.rect(15, rowY, 180, 7, "FD");

          // Text content
          doc.setTextColor(15, 23, 42);
          doc.setFont("helvetica", "bold");
          doc.text(item.side, 18, rowY + 4.8);
          doc.text(item.type, 53, rowY + 4.8);

          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85); // Slate 700
          const truncatedSpecs = item.specs.length > 70 ? item.specs.substring(0, 67) + "..." : item.specs;
          doc.text(truncatedSpecs, 88, rowY + 4.8);

          rowY += 7;
        });

        if (allElements.length > 5) {
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(241, 245, 249);
          doc.rect(15, rowY, 180, 6, "FD");
          doc.setTextColor(100, 116, 139);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7.5);
          doc.text(`* Plus ${allElements.length - 5} additional print layers. Refer to digital dashboard studio for active canvas details.`, 18, rowY + 4);
        }
      }

      // 5. FOOTER & COMPLIANCE DISCLOSURE
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 266, 195, 266);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text("This blueprint spec sheet acts as the formal authorization for screen printing and screen-set placement. Fabric base colors and canvas graphics printed on this document are software-simulated mockups. Custom colors and alignments might experience minimal deviations in physical manufacturing depending on apparel fabric weave, material characteristics, and printing machine setup.", 15, 271, { maxWidth: 180 });

      // Slate Bottom footer block
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 286, 210, 11, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("KT ADHESIVE CUSTOM CLOTHING STUDIO", 15, 293);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text("Page 1 of 1", 182, 293);

      doc.save(`tshirt_design_specification_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export Failure:", error);
      alert("Failed to export PDF. Please retry.");
    }
  };

  const handleSaveDesign = async () => {
    const frontPreview = elements.front.length > 0 ? await renderCanvasToDataURL("front") : undefined;
    const backPreview = elements.back.length > 0 ? await renderCanvasToDataURL("back") : undefined;

    setConfirmPreviews({ front: frontPreview, back: backPreview });
    setInspectSide(elements.front.length > 0 ? "front" : "back");
    setShowSaveConfirm(true);
  };

  const handleFinalSave = () => {
    // Collate Editor State for Re-editing
    const stateObj = {
      elements,
      color: tshirtColor,
      designerSide
    };

    onSave(confirmPreviews, stateObj);
    setShowSaveConfirm(false);
    onClose();
  };

  // ==========================================
  // SIDE SELECTOR TRANSITIONS
  // ==========================================
  const handleSelectSideMode = (mode: "front" | "back" | "both") => {
    setDesignerSide(mode);
    setCurrentSide(mode === "back" ? "back" : "front");
    setShowSelector(false);
  };

  // Safe check if any item is selected
  const activeElement = elements[currentSide].find((el) => el.id === selectedElementId) || null;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] overflow-hidden bg-neutral-950/95 font-sans text-white select-none">

        {/* ==========================================
            INTRO SELECTOR MODAL
            ========================================== */}
        {showSelector ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex min-h-screen items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-md"
          >
            <div className="relative w-full max-w-4xl rounded-3xl border border-neutral-800 bg-neutral-950 p-8 shadow-2xl md:p-12">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="text-center mb-10">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#B87D4C]">Custom Playground</span>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  Which side do you want to design?
                </h2>
                <p className="mt-2 text-sm text-neutral-400">
                  Select a blank T-shirt face to customize. You can modify your side layout at any point inside.
                </p>
              </div>

              {/* Grid of options */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

                {/* FRONT CARD */}
                <div
                  onClick={() => handleSelectSideMode("front")}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-center transition-all hover:border-[#B87D4C] hover:bg-neutral-900 hover:shadow-lg hover:shadow-[#B87D4C]/20"
                >
                  <div className="mx-auto mb-6 h-48 w-44 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
                    <TShirtSVG color="#171717" side="front" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Front Only</h3>
                  <p className="mt-1 text-xs text-neutral-400">Customize chest-side graphic workspace only.</p>
                  <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-[#B87D4C]/40 pointer-events-none transition-all" />
                </div>

                {/* BACK CARD */}
                <div
                  onClick={() => handleSelectSideMode("back")}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-center transition-all hover:border-[#B87D4C] hover:bg-neutral-900 hover:shadow-lg hover:shadow-[#B87D4C]/20"
                >
                  <div className="mx-auto mb-6 h-48 w-44 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
                    <TShirtSVG color="#171717" side="back" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Back Only</h3>
                  <p className="mt-1 text-xs text-neutral-400">Customize rear-shoulder blade print workspace only.</p>
                  <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-[#B87D4C]/40 pointer-events-none transition-all" />
                </div>

                {/* BOTH FRONT & BACK CARD */}
                <div
                  onClick={() => handleSelectSideMode("both")}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 text-center transition-all hover:border-[#B87D4C] hover:bg-[#B87D4C]/5 hover:shadow-lg hover:shadow-[#B87D4C]/30"
                >
                  <div className="mx-auto mb-6 flex h-48 w-44 items-center justify-center gap-1 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
                    <div className="w-1/2 scale-90 -translate-x-2">
                      <TShirtSVG color="#171717" side="front" />
                    </div>
                    <div className="w-1/2 scale-90 translate-x-2">
                      <TShirtSVG color="#171717" side="back" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-[#B87D4C]">Front & Back</h3>
                  <p className="mt-1 text-xs text-neutral-400">Full designer suite for both front chest and back layers.</p>
                  <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-neutral-800 group-hover:border-[#B87D4C] pointer-events-none transition-all" />
                </div>

              </div>
            </div>
          </motion.div>
        ) : (

          /* ==========================================
              MAIN FULL-SCREEN EDITOR PLAYGROUND
              ========================================== */
          <div className="flex h-screen flex-col">

            {/* 1. TOP TOOLBAR WITH GLASSMORPHISM */}
            <header className="flex h-16 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-6 backdrop-blur-md sticky top-0 z-50">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSelector(true)}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-all font-medium"
                >
                  <Palette className="h-4 w-4" /> Reset Sides
                </button>
                <div className="h-4 w-[1px] bg-neutral-800" />
                <span className="text-sm font-semibold tracking-wide text-neutral-200">
                  Custom T-Shirt Studio
                </span>
              </div>

              {/* Side toggling switcher (front/back) if Front & Back was selected */}
              {designerSide === "both" && (
                <div className="flex items-center rounded-lg bg-neutral-900 p-1 border border-neutral-800">
                  <button
                    onClick={() => {
                      setCurrentSide("front");
                      setSelectedElementId(null);
                    }}
                    className={`rounded-md px-4 py-1 text-xs font-semibold transition-all ${currentSide === "front" ? "bg-[#B87D4C] text-white shadow-md" : "text-neutral-400 hover:text-white"
                      }`}
                  >
                    Front Design
                  </button>
                  <button
                    onClick={() => {
                      setCurrentSide("back");
                      setSelectedElementId(null);
                    }}
                    className={`rounded-md px-4 py-1 text-xs font-semibold transition-all ${currentSide === "back" ? "bg-[#B87D4C] text-white shadow-md" : "text-neutral-400 hover:text-white"
                      }`}
                  >
                    Back Design
                  </button>
                </div>
              )}

              {/* Actions & Utilities */}
              <div className="flex items-center gap-3">
                {/* Undo / Redo */}
                <div className="flex items-center rounded-lg bg-neutral-900 border border-neutral-800 p-0.5">
                  <button
                    onClick={handleUndo}
                    disabled={historyIndex[currentSide] <= 0}
                    className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Undo"
                  >
                    <Undo2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled={historyIndex[currentSide] >= history[currentSide].length - 1}
                    className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Redo"
                  >
                    <Redo2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Preview */}
                <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#B87D4C]/40 bg-[#B87D4C]/10 px-3.5 py-1.5 text-xs font-semibold text-[#B87D4C] hover:bg-[#B87D4C]/20 hover:border-[#B87D4C] transition-all shadow-md shadow-[#B87D4C]/5"
                >
                  <Eye className="h-3.5 w-3.5" /> Preview Design
                </button>

                {/* Export PDF */}
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white hover:bg-neutral-800 transition-all shadow-md"
                  title="Export High-Fidelity Design PDF Sheet"
                >
                  <FileDown className="h-3.5 w-3.5 text-[#B87D4C]" /> Export PDF Spec
                </button>

                {/* Finish & Save */}
                <button
                  onClick={handleSaveDesign}
                  className="flex items-center gap-1.5 rounded-lg bg-[#B87D4C] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#B87D4C] transition-all shadow-lg shadow-[#B87D4C]/20"
                >
                  <Save className="h-3.5 w-3.5" /> Save Design
                </button>

                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all ml-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            {/* MAIN PANELS WRAPPER */}
            <div className="flex flex-1 overflow-hidden">

              {/* 2. LEFT SIDEBAR (TOOLS) */}
              <aside className="w-[84px] md:w-[240px] flex flex-col md:flex-row border-r border-neutral-800 bg-neutral-950">
                {/* Mini icon navigation */}
                <div className="flex flex-col gap-4 border-b md:border-b-0 md:border-r border-neutral-800 p-3 items-center w-full md:w-[72px]">
                  <button
                    onClick={() => setActiveTab("upload")}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl w-full text-center transition-all ${activeTab === "upload" ? "bg-[#B87D4C]/10 text-[#B87D4C]" : "text-neutral-400 hover:text-white"
                      }`}
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-[10px] font-medium hidden md:block">Upload</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("text")}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl w-full text-center transition-all ${activeTab === "text" ? "bg-[#B87D4C]/10 text-[#B87D4C]" : "text-neutral-400 hover:text-white"
                      }`}
                  >
                    <Type className="h-5 w-5" />
                    <span className="text-[10px] font-medium hidden md:block">Text</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("shapes")}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl w-full text-center transition-all ${activeTab === "shapes" ? "bg-[#B87D4C]/10 text-[#B87D4C]" : "text-neutral-400 hover:text-white"
                      }`}
                  >
                    <Square className="h-5 w-5" />
                    <span className="text-[10px] font-medium hidden md:block">Shapes</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("layers")}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl w-full text-center transition-all ${activeTab === "layers" ? "bg-[#B87D4C]/10 text-[#B87D4C]" : "text-neutral-400 hover:text-white"
                      }`}
                  >
                    <Layers className="h-5 w-5" />
                    <span className="text-[10px] font-medium hidden md:block">Layers</span>
                  </button>
                </div>

                {/* Sub Panel Details */}
                <div className="flex-1 p-4 overflow-y-auto hidden md:block select-text">

                  {/* UPLOADS PANEL */}
                  {activeTab === "upload" && (
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-bold text-neutral-200">Upload Logo / Image</h4>

                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleImageUpload(e);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center border border-dashed border-neutral-800 hover:border-[#B87D4C] rounded-xl p-6 bg-neutral-900/30 cursor-pointer transition-all gap-2 text-center group"
                      >
                        <Upload className="h-8 w-8 text-neutral-500 group-hover:text-[#B87D4C] transition-all" />
                        <span className="text-xs font-semibold text-neutral-300">Drag & Drop file</span>
                        <span className="text-[10px] text-neutral-500">Supports PNG, JPG, SVG</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          multiple
                          accept="image/*"
                          className="hidden"
                        />
                      </div>

                      {/* Display active side uploads for easy re-adding */}
                      <div className="mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Active Layers</span>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {elements[currentSide].filter(el => el.type === 'image').map((el) => (
                            <div
                              key={el.id}
                              onClick={() => setSelectedElementId(el.id)}
                              className="relative aspect-square border border-neutral-800 rounded-lg overflow-hidden bg-neutral-900 cursor-pointer hover:border-neutral-600"
                            >
                              <img src={el.content} className="w-full h-full object-contain p-1" alt="layer thumbnail" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TEXT PANEL */}
                  {activeTab === "text" && (
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-bold text-neutral-200">Typography Tools</h4>
                      <button
                        onClick={handleAddText}
                        className="w-full py-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-bold hover:border-[#B87D4C] hover:text-[#B87D4C] transition-all text-xs flex items-center justify-center gap-1.5"
                      >
                        <Plus className="h-4 w-4" /> Add Text Layer
                      </button>
                      <p className="text-[10px] text-neutral-500 leading-normal">
                        Clicking the button inserts a customizable typography layer to your active canvas side. Use the right settings panel to control formatting.
                      </p>
                    </div>
                  )}

                  {/* SHAPES PANEL */}
                  {activeTab === "shapes" && (
                    <div className="flex flex-col gap-4">
                      <h4 className="text-sm font-bold text-neutral-200">Shapes Suite</h4>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleAddShape("rect")}
                          className="flex flex-col items-center justify-center border border-neutral-800 hover:border-[#B87D4C] bg-neutral-900/30 rounded-xl p-3.5 gap-2 transition-all group"
                        >
                          <Square className="h-5 w-5 text-neutral-400 group-hover:text-white" />
                          <span className="text-[10px] text-neutral-400">Rectangle</span>
                        </button>
                        <button
                          onClick={() => handleAddShape("circle")}
                          className="flex flex-col items-center justify-center border border-neutral-800 hover:border-[#B87D4C] bg-neutral-900/30 rounded-xl p-3.5 gap-2 transition-all group"
                        >
                          <Circle className="h-5 w-5 text-neutral-400 group-hover:text-white" />
                          <span className="text-[10px] text-neutral-400">Circle</span>
                        </button>
                        <button
                          onClick={() => handleAddShape("star")}
                          className="flex flex-col items-center justify-center border border-neutral-800 hover:border-[#B87D4C] bg-neutral-900/30 rounded-xl p-3.5 gap-2 transition-all group"
                        >
                          <Star className="h-5 w-5 text-neutral-400 group-hover:text-white" />
                          <span className="text-[10px] text-neutral-400">Star</span>
                        </button>
                        <button
                          onClick={() => handleAddShape("triangle")}
                          className="flex flex-col items-center justify-center border border-neutral-800 hover:border-[#B87D4C] bg-neutral-900/30 rounded-xl p-3.5 gap-2 transition-all group"
                        >
                          <TriangleIcon className="h-5 w-5 text-neutral-400 group-hover:text-white" />
                          <span className="text-[10px] text-neutral-400">Triangle</span>
                        </button>
                        <button
                          onClick={() => handleAddShape("heart")}
                          className="flex flex-col items-center justify-center border border-neutral-800 hover:border-[#B87D4C] bg-neutral-900/30 rounded-xl p-3.5 gap-2 transition-all group"
                        >
                          <Heart className="h-5 w-5 text-neutral-400 group-hover:text-white" />
                          <span className="text-[10px] text-neutral-400">Heart</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LAYERS PANEL */}
                  {activeTab === "layers" && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-sm font-bold text-neutral-200">Layer Manager</h4>
                      {elements[currentSide].length === 0 ? (
                        <span className="text-xs text-neutral-600 block mt-2">No active layers on this side.</span>
                      ) : (
                        <div className="flex flex-col gap-1.5 mt-2">
                          {[...elements[currentSide]].sort((a, b) => b.zIndex - a.zIndex).map((el) => (
                            <div
                              key={el.id}
                              onClick={() => setSelectedElementId(el.id)}
                              className={`flex items-center justify-between rounded-lg p-2 border transition-all cursor-pointer ${selectedElementId === el.id
                                ? "border-[#B87D4C] bg-[#B87D4C]/5 text-[#B87D4C]"
                                : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:bg-neutral-900"
                                }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                {el.type === "text" && <Type className="h-3.5 w-3.5 flex-shrink-0" />}
                                {el.type === "image" && <Upload className="h-3.5 w-3.5 flex-shrink-0" />}
                                {el.type === "shape" && <Square className="h-3.5 w-3.5 flex-shrink-0" />}
                                <span className="text-xs truncate font-medium">
                                  {el.type === "text" ? el.content : el.type === "image" ? "Image Logo" : `Shape: ${el.content}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteElement(el.id);
                                  }}
                                  className="p-1 hover:text-red-500 rounded text-neutral-500"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </aside>

              {/* 3. CENTER CANVAS (PLAYGROUND WORKSPACE) */}
              <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden bg-neutral-900 bg-[radial-gradient(#171717_1px,transparent_1px)] [background-size:16px_16px]">

                {/* Zoom indicator / scale buttons overlay */}
                <div className="absolute bottom-6 left-6 flex items-center rounded-xl bg-neutral-950 border border-neutral-800 shadow-xl p-1 z-35 gap-1">
                  <button
                    onClick={() => setZoom(Math.max(0.6, zoom - 0.15))}
                    className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-all"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-xs font-bold text-neutral-300 w-12 text-center select-none">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(1.8, zoom + 0.15))}
                    className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-all"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <div className="h-4 w-[1px] bg-neutral-800" />
                  <button
                    onClick={() => {
                      setZoom(1);
                      setElements((prev) => ({ ...prev, [currentSide]: [] }));
                      setHistory((prev) => ({ ...prev, [currentSide]: [[]] }));
                      setHistoryIndex((prev) => ({ ...prev, [currentSide]: 0 }));
                      setSelectedElementId(null);
                    }}
                    className="p-2 text-neutral-400 hover:text-red-400 rounded-lg hover:bg-neutral-900 transition-all"
                    title="Reset Canvas Elements"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>

                {/* THE T-SHIRT INTERACTIVE CONTAINER */}
                <motion.div
                  animate={{ scale: zoom }}
                  className="relative w-full max-w-[480px] aspect-square flex items-center justify-center select-none cursor-default"
                  onClick={() => setSelectedElementId(null)}
                >

                  {/* Backdrop T-Shirt Visual */}
                  <TShirtSVG color={tshirtColor} side={currentSide} />

                  {/* PRINTABLE AREA BOUNDARY BOX */}
                  {/* Absolute aligned inside the T-shirt chest/back grid: left 32%, top 25%, width 36%, height 46% */}
                  <div
                    ref={canvasRef}
                    className="absolute left-[32%] top-[25%] w-[36%] h-[46%] border-2 border-dashed border-[#B87D4C]/40 rounded-lg z-40 transition-colors hover:border-[#B87D4C]/70"
                  >
                    <div className="absolute top-1 left-2 text-[8px] font-bold text-[#B87D4C] uppercase tracking-wider opacity-60">
                      Printable Area
                    </div>

                    {/* RENDER CANVAS ELEMENTS */}
                    {elements[currentSide].map((el) => {
                      const isSelected = el.id === selectedElementId;
                      return (
                        <div
                          key={el.id}
                          id={`dom_${el.id}`}
                          style={{
                            position: "absolute",
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: `${el.width}%`,
                            height: `${el.height}%`,
                            transform: `rotate(${el.rotation}deg)`,
                            zIndex: el.zIndex
                          }}
                          className={`group flex items-center justify-center ${isSelected ? "ring-2 ring-[#B87D4C] cursor-move" : "hover:ring-1 hover:ring-neutral-500 cursor-pointer"
                            }`}
                          onMouseDown={(e) => handleInteractionStart(e, el, "drag")}
                          onTouchStart={(e) => handleInteractionStart(e, el, "drag")}
                        >

                          {/* ELEMENT INTERNAL CONTENT */}
                          {el.type === "image" && (
                            <img
                              src={el.content}
                              className="w-full h-full object-contain select-none pointer-events-none"
                              alt="custom design layer"
                            />
                          )}

                          {el.type === "text" && (
                            <div
                              style={{
                                fontFamily: el.fontFamily,
                                color: el.color,
                                fontWeight: el.bold ? "bold" : "normal",
                                fontStyle: el.italic ? "italic" : "normal",
                                textDecoration: el.underline ? "underline" : "none",
                                textAlign: el.align || "center",
                                fontSize: "14px", // Dynamic auto-scales inside wrapper
                                width: "100%"
                              }}
                              className="select-none pointer-events-none break-words leading-tight"
                            >
                              {el.content}
                            </div>
                          )}

                          {el.type === "shape" && (
                            <div className="w-full h-full pointer-events-none select-none">
                              {el.shapeType === "rect" && <div className="w-full h-full" style={{ backgroundColor: el.fillColor }} />}
                              {el.shapeType === "circle" && <div className="w-full h-full rounded-full" style={{ backgroundColor: el.fillColor }} />}
                              {el.shapeType === "triangle" && (
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                  <polygon points="50,5 95,95 5,95" fill={el.fillColor} />
                                </svg>
                              )}
                              {el.shapeType === "star" && (
                                <svg viewBox="0 0 24 24" className="w-full h-full">
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={el.fillColor} />
                                </svg>
                              )}
                              {el.shapeType === "heart" && (
                                <svg viewBox="0 0 24 24" className="w-full h-full">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={el.fillColor} />
                                </svg>
                              )}
                            </div>
                          )}

                          {/* SELECTION HUD / GESTURE CONTROLS */}
                          {isSelected && (
                            <>
                              {/* ROTATION RIAL HANDLE (TOP CONNECTED LINE) */}
                              <div
                                onMouseDown={(e) => handleInteractionStart(e, el, "rotate")}
                                onTouchStart={(e) => handleInteractionStart(e, el, "rotate")}
                                className="absolute -top-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border border-neutral-700 bg-neutral-900 hover:bg-[#B87D4C] text-neutral-300 hover:text-white flex items-center justify-center cursor-alias shadow-lg"
                                title="Rotate"
                              >
                                <RotateCcw className="h-2.5 w-2.5 rotate-45" />
                              </div>
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[1.5px] h-2 bg-[#B87D4C]" />

                              {/* SCALE CORNER GRAB HANDLE */}
                              <div
                                onMouseDown={(e) => handleInteractionStart(e, el, "resize")}
                                onTouchStart={(e) => handleInteractionStart(e, el, "resize")}
                                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#B87D4C] cursor-se-resize shadow-md"
                                title="Scale"
                              />

                              {/* QUICK LAYER/ELEMENT HUD OVERLAY (TOP FLOATING ACTIONS) */}
                              <div
                                className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center bg-neutral-950 border border-neutral-800 rounded-md shadow-2xl p-0.5 z-[99] gap-0.5 text-[10px]"
                                onMouseDown={(e) => e.stopPropagation()} // stop canvas select trigger
                              >
                                <button
                                  onClick={() => duplicateElement(el.id)}
                                  className="p-1 text-neutral-400 hover:text-white rounded"
                                  title="Duplicate"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => changeLayerOrder("forward", el.id)}
                                  className="p-1 text-neutral-400 hover:text-white rounded"
                                  title="Bring Forward"
                                >
                                  <ChevronUp className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => changeLayerOrder("backward", el.id)}
                                  className="p-1 text-neutral-400 hover:text-white rounded"
                                  title="Send Backward"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </button>
                                <div className="w-[1px] h-3 bg-neutral-800 mx-0.5" />
                                <button
                                  onClick={() => deleteElement(el.id)}
                                  className="p-1 text-red-400 hover:text-red-300 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}

                  </div>
                </motion.div>
              </main>

              {/* 4. RIGHT SETTINGS PANEL (DYNAMIC PROPERTY CONTROLS) */}
              <aside className="w-[280px] border-l border-neutral-800 bg-neutral-950 p-5 overflow-y-auto hidden lg:block select-text">
                <div className="flex flex-col gap-6">

                  {/* CONDITIONAL SETTING 1: NOTHING SELECTED -> CANVAS SETTINGS */}
                  {!activeElement ? (
                    <div className="flex flex-col gap-5">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-200">Canvas Configuration</h4>
                        <p className="text-xs text-neutral-400 mt-1">Configure workspace environment settings.</p>
                      </div>

                      {/* Product T-Shirt Colors */}
                      <div className="flex flex-col gap-2.5">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                          <Palette className="h-3.5 w-3.5 text-[#B87D4C]" /> Product T-Shirt Color
                        </label>

                        <div className="grid grid-cols-5 gap-2 mt-1">
                          {PRESET_COLORS.map((c) => (
                            <button
                              key={c.hex}
                              onClick={() => setTshirtColor(c.hex)}
                              style={{ backgroundColor: c.hex }}
                              className={`aspect-square rounded-full border-2 transition-all relative ${tshirtColor.toLowerCase() === c.hex.toLowerCase()
                                ? "border-[#B87D4C] scale-110 shadow-lg shadow-[#B87D4C]/40"
                                : "border-neutral-800 hover:scale-105"
                                }`}
                              title={c.name}
                            >
                              {tshirtColor.toLowerCase() === c.hex.toLowerCase() && (
                                <Check
                                  className={`absolute inset-0 m-auto h-3 w-3 ${c.hex === "#FFFFFF" ? "text-neutral-900" : "text-white"
                                    }`}
                                />
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Custom Hex Color Input */}
                        <div className="flex items-center gap-2 mt-2 bg-neutral-900 border border-neutral-800 rounded-lg p-2">
                          <input
                            type="color"
                            value={tshirtColor}
                            onChange={(e) => setTshirtColor(e.target.value)}
                            className="w-6 h-6 rounded-md border-0 bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={tshirtColor}
                            onChange={(e) => setTshirtColor(e.target.value)}
                            className="bg-transparent text-xs font-semibold uppercase tracking-wider text-neutral-300 outline-none w-full"
                          />
                        </div>
                      </div>

                      <div className="h-[1px] bg-neutral-800 my-1" />

                      {/* Info Panel guidelines */}
                      <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 gap-2.5 flex flex-col text-[11px] leading-normal text-neutral-400">
                        <span className="font-bold text-neutral-300">💡 Customizing Instructions</span>
                        <span>• Select a sidebar tool on the left to add a custom image, shapes or editable text layer.</span>
                        <span>• Click on any layer directly inside the dashed printable box to scale, rotate, drag, layer order, duplicate or edit properties.</span>
                      </div>
                    </div>
                  ) : (

                    /* CONDITIONAL SETTING 2: ELEMENT SELECTED */
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                          {activeElement.type} Selected
                        </span>
                        <button
                          onClick={() => setSelectedElementId(null)}
                          className="text-[10px] font-semibold text-[#B87D4C] hover:underline"
                        >
                          Deselect
                        </button>
                      </div>

                      {/* TEXT FORM LAYERS SETTINGS */}
                      {activeElement.type === "text" && (
                        <div className="flex flex-col gap-4">

                          {/* Editable text string */}
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Edit Text Value</label>
                            <input
                              type="text"
                              value={activeElement.content}
                              onChange={(e) => updateElementProperties(activeElement.id, { content: e.target.value })}
                              className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#B87D4C] rounded-lg px-3 py-2 text-xs font-medium text-white outline-none select-text"
                            />
                          </div>

                          {/* Font Family Selector */}
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Font Family</label>
                            <select
                              value={activeElement.fontFamily || "Outfit"}
                              onChange={(e) => updateElementProperties(activeElement.id, { fontFamily: e.target.value })}
                              className="w-full bg-neutral-900 border border-neutral-800 focus:border-[#B87D4C] rounded-lg px-2.5 py-2 text-xs font-medium text-white outline-none"
                            >
                              {FONTS.map((font) => (
                                <option key={font} value={font}>
                                  {font}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Font Size & Alignment Row */}
                          <div className="grid grid-cols-2 gap-3.5">

                            {/* Font size picker */}
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Font Size</label>
                              <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1">
                                <button
                                  onClick={() =>
                                    updateElementProperties(activeElement.id, {
                                      fontSize: Math.max(10, (activeElement.fontSize || 24) - 2)
                                    })
                                  }
                                  className="text-xs text-neutral-400 hover:text-white font-extrabold w-4"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-white w-full text-center">
                                  {activeElement.fontSize || 24}
                                </span>
                                <button
                                  onClick={() =>
                                    updateElementProperties(activeElement.id, {
                                      fontSize: Math.min(80, (activeElement.fontSize || 24) + 2)
                                    })
                                  }
                                  className="text-xs text-neutral-400 hover:text-white font-extrabold w-4"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Alignment Options */}
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Text Align</label>
                              <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                                <button
                                  onClick={() => updateElementProperties(activeElement.id, { align: "left" })}
                                  className={`flex-1 flex justify-center py-1 rounded ${activeElement.align === "left" ? "bg-neutral-800 text-[#B87D4C]" : "text-neutral-400 hover:text-white"
                                    }`}
                                >
                                  <AlignLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => updateElementProperties(activeElement.id, { align: "center" })}
                                  className={`flex-1 flex justify-center py-1 rounded ${activeElement.align === "center" ? "bg-neutral-800 text-[#B87D4C]" : "text-neutral-400 hover:text-white"
                                    }`}
                                >
                                  <AlignCenter className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => updateElementProperties(activeElement.id, { align: "right" })}
                                  className={`flex-1 flex justify-center py-1 rounded ${activeElement.align === "right" ? "bg-neutral-800 text-[#B87D4C]" : "text-neutral-400 hover:text-white"
                                    }`}
                                >
                                  <AlignRight className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                          </div>

                          {/* Typography Formatting Buttons */}
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Formatting</label>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateElementProperties(activeElement.id, { bold: !activeElement.bold })}
                                className={`flex-1 flex justify-center py-2.5 border rounded-lg transition-all ${activeElement.bold
                                  ? "border-[#B87D4C] bg-[#B87D4C]/5 text-[#B87D4C] font-bold"
                                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                                  }`}
                              >
                                <Bold className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateElementProperties(activeElement.id, { italic: !activeElement.italic })}
                                className={`flex-1 flex justify-center py-2.5 border rounded-lg transition-all ${activeElement.italic
                                  ? "border-[#B87D4C] bg-[#B87D4C]/5 text-[#B87D4C]"
                                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                                  }`}
                              >
                                <Italic className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => updateElementProperties(activeElement.id, { underline: !activeElement.underline })}
                                className={`flex-1 flex justify-center py-2.5 border rounded-lg transition-all ${activeElement.underline
                                  ? "border-[#B87D4C] bg-[#B87D4C]/5 text-[#B87D4C]"
                                  : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                                  }`}
                              >
                                <Underline className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Font Color Picker */}
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Text Color</label>
                            <div className="flex items-center gap-2 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg p-2">
                              <input
                                type="color"
                                value={activeElement.color || "#FFFFFF"}
                                onChange={(e) => updateElementProperties(activeElement.id, { color: e.target.value })}
                                className="w-6 h-6 rounded-md border-0 bg-transparent cursor-pointer"
                              />
                              <input
                                type="text"
                                value={activeElement.color || "#FFFFFF"}
                                onChange={(e) => updateElementProperties(activeElement.id, { color: e.target.value })}
                                className="bg-transparent text-xs font-semibold uppercase tracking-wider text-neutral-300 outline-none w-full"
                              />
                            </div>
                          </div>

                        </div>
                      )}

                      {/* SHAPES LAYERS PROPERTY SETTINGS */}
                      {activeElement.type === "shape" && (
                        <div className="flex flex-col gap-4">

                          {/* Shape fill colors */}
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Fill Color</label>
                            <div className="flex items-center gap-2 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg p-2">
                              <input
                                type="color"
                                value={activeElement.fillColor || "#B87D4C"}
                                onChange={(e) => updateElementProperties(activeElement.id, { fillColor: e.target.value })}
                                className="w-6 h-6 rounded-md border-0 bg-transparent cursor-pointer"
                              />
                              <input
                                type="text"
                                value={activeElement.fillColor || "#B87D4C"}
                                onChange={(e) => updateElementProperties(activeElement.id, { fillColor: e.target.value })}
                                className="bg-transparent text-xs font-semibold uppercase tracking-wider text-neutral-300 outline-none w-full"
                              />
                            </div>
                          </div>

                        </div>
                      )}

                      {/* IMAGE LAYERS SPECIFIC UTILITIES */}
                      {activeElement.type === "image" && (
                        <div className="flex flex-col gap-4">

                          <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 gap-2 flex flex-col text-[11px] leading-normal text-neutral-400">
                            <span className="font-bold text-neutral-300">🎨 Image Operations</span>
                            <span>• Drag the bottom-right orange corner circle to scale the logo up or down smoothly.</span>
                            <span>• Grab the circular top rotation handle and swing to spin your asset to any degree angle.</span>
                          </div>

                        </div>
                      )}

                      {/* TRANSFORMATION COORDINATES SLIDERS */}
                      <div className="h-[1px] bg-neutral-800 my-2" />

                      <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Precise Rotation</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={activeElement.rotation}
                            onChange={(e) => updateElementProperties(activeElement.id, { rotation: Number(e.target.value) })}
                            className="w-full h-1 bg-neutral-800 accent-[#B87D4C] rounded-lg cursor-pointer"
                          />
                          <span className="text-xs font-bold text-neutral-300 w-8 text-right font-mono">
                            {activeElement.rotation}°
                          </span>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </aside>

            </div>
          </div>
        )}

        {/* ==========================================
            DESIGN PREVIEW MODAL
            ========================================== */}
        <AnimatePresence>
          {isPreviewModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100000] flex items-center justify-center bg-neutral-950/85 backdrop-blur-xl p-4 md:p-8"
              onClick={() => setIsPreviewModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="relative w-full max-w-5xl rounded-3xl border border-neutral-800 bg-neutral-950 p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="absolute top-5 right-5 rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all z-[100002]"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Header Info */}
                <div className="text-center mb-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#B87D4C]">Mockup Showcase</span>
                  <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                    High-Fidelity Preview
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    Behold your premium customizable layout rendered cleanly without boundary lines or grid lines.
                  </p>
                </div>

                {/* Preview View Selector */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center rounded-xl bg-neutral-900 p-1 border border-neutral-800 shadow-inner">
                    <button
                      onClick={() => setPreviewSide("front")}
                      className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${previewSide === "front" ? "bg-[#B87D4C] text-white shadow-md" : "text-neutral-400 hover:text-white"
                        }`}
                    >
                      Front View
                    </button>
                    <button
                      onClick={() => setPreviewSide("back")}
                      className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${previewSide === "back" ? "bg-[#B87D4C] text-white shadow-md" : "text-neutral-400 hover:text-white"
                        }`}
                    >
                      Back View
                    </button>
                    <button
                      onClick={() => setPreviewSide("both")}
                      className={`rounded-lg px-5 py-2 text-xs font-bold transition-all ${previewSide === "both" ? "bg-[#B87D4C] text-white shadow-md" : "text-neutral-400 hover:text-white"
                        }`}
                    >
                      Front & Back
                    </button>
                  </div>
                </div>

                {/* Mockups Container */}
                <div className="flex-1 overflow-y-auto px-2 py-4 flex items-center justify-center">
                  {previewSide === "front" && (
                    <div className="w-full flex justify-center">
                      <TShirtPreviewCard color={tshirtColor} side="front" elementsList={elements.front} size="large" />
                    </div>
                  )}

                  {previewSide === "back" && (
                    <div className="w-full flex justify-center">
                      <TShirtPreviewCard color={tshirtColor} side="back" elementsList={elements.back} size="large" />
                    </div>
                  )}

                  {previewSide === "both" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full justify-items-center max-w-4xl">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Chest Side (Front)</span>
                        <TShirtPreviewCard color={tshirtColor} side="front" elementsList={elements.front} size="small" />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Rear Side (Back)</span>
                        <TShirtPreviewCard color={tshirtColor} side="back" elementsList={elements.back} size="small" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Stats & Color */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-neutral-800 pt-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-neutral-700 shadow-inner" style={{ backgroundColor: tshirtColor }} />
                    <span className="text-xs font-medium text-neutral-300">
                      Product Color: <span className="font-bold text-white uppercase tracking-wider">{PRESET_COLORS.find(c => c.hex.toLowerCase() === tshirtColor.toLowerCase())?.name || tshirtColor}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setIsPreviewModalOpen(false)}
                      className="w-full sm:w-auto rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white px-6 py-2.5 text-xs font-bold transition-all"
                    >
                      Back to Editing
                    </button>
                  </div>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==========================================
            SAVE DESIGN CONFIRMATION & REVIEW MODAL
            ========================================== */}
        <AnimatePresence>
          {showSaveConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100005] flex items-center justify-center bg-neutral-950/90 backdrop-blur-xl p-4 md:p-8 animate-fade-in"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="relative w-full max-w-6xl rounded-3xl border border-neutral-800 bg-neutral-950 p-6 md:p-8 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
              >
                {/* Header Info */}
                <div className="text-center mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#B87D4C]">Confirm Apparel Technical Specifications</span>
                  <h3 className="mt-1 text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                    Review Your Custom Layout
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400">
                    Verify placement, layout aesthetics, and zoom in on print details inside our HD Print Inspector before finalizing.
                  </p>
                </div>

                {/* Main Split Grid */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch overflow-y-auto px-2 py-4">

                  {/* Left Column: Full Mockup Panel (Col 7) */}
                  <div className="lg:col-span-7 flex flex-col items-center justify-center bg-neutral-900/40 rounded-2xl border border-neutral-800/60 p-6 relative overflow-hidden">
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      <Eye className="h-3.5 w-3.5" /> Full Mockup Review
                    </div>

                    <div className="w-full flex items-center justify-center gap-6 mt-4 flex-wrap">
                      {/* Show Front Preview if customized */}
                      {elements.front.length > 0 && (
                        <div className="flex flex-col items-center gap-2">
                          <TShirtPreviewCard color={tshirtColor} side="front" elementsList={elements.front} size="small" />
                          <span className="text-xs font-bold text-neutral-400">Front Design</span>
                        </div>
                      )}

                      {/* Show Back Preview if customized */}
                      {elements.back.length > 0 && (
                        <div className="flex flex-col items-center gap-2">
                          <TShirtPreviewCard color={tshirtColor} side="back" elementsList={elements.back} size="small" />
                          <span className="text-xs font-bold text-neutral-400">Back Design</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: HD Print Inspector (Col 5) */}
                  <div className="lg:col-span-5 flex flex-col items-center justify-between bg-neutral-900/60 rounded-2xl border border-neutral-800/80 p-6 relative overflow-hidden">
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      <Layers className="h-3.5 w-3.5 text-[#B87D4C]" /> HD Detail Inspector
                    </div>

                    {/* Toggle if both sides are designed */}
                    {elements.front.length > 0 && elements.back.length > 0 && (
                      <div className="mt-6 flex items-center rounded-xl bg-neutral-950 p-1 border border-neutral-800 shadow-inner z-10">
                        <button
                          onClick={() => setInspectSide("front")}
                          className={`rounded-lg px-4 py-1.5 text-[10px] font-extrabold uppercase transition-all ${inspectSide === "front" ? "bg-[#B87D4C] text-white shadow-md" : "text-neutral-400 hover:text-white"
                            }`}
                        >
                          Inspect Front
                        </button>
                        <button
                          onClick={() => setInspectSide("back")}
                          className={`rounded-lg px-4 py-1.5 text-[10px] font-extrabold uppercase transition-all ${inspectSide === "back" ? "bg-[#B87D4C] text-white shadow-md" : "text-neutral-400 hover:text-white"
                            }`}
                        >
                          Inspect Back
                        </button>
                      </div>
                    )}

                    {/* Magnifier Viewport Wrapper */}
                    <div className="relative flex items-center justify-center my-6 py-6 w-full">

                      {/* Curved Technical Dashed SVG Arrow pointing from Mockup to Magnifier */}
                      <svg viewBox="0 0 100 100" className="absolute top-[40%] -left-6 w-14 h-14 pointer-events-none select-none text-[#B87D4C] hidden lg:block drop-shadow-[0_0_8px_rgba(184,125,76,0.4)]">
                        <path
                          d="M 10,80 Q 25,25 80,40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray="4 3"
                        />
                        <polygon points="80,40 70,36 74,45" fill="currentColor" />
                      </svg>

                      {/* THE MAGNIFIER GLASS */}
                      <div className="relative w-64 h-64 rounded-full border-4 border-[#B87D4C] shadow-[0_0_35px_rgba(184,125,76,0.25),inset_0_0_20px_rgba(0,0,0,0.8)] overflow-hidden bg-neutral-950 flex items-center justify-center z-10 transition-transform duration-300 hover:scale-105">

                        {/* Circular grid lines simulating target/lens view */}
                        <div className="absolute inset-0 border border-neutral-700/10 rounded-full scale-75 pointer-events-none z-20" />
                        <div className="absolute inset-0 border border-neutral-700/10 rounded-full scale-50 pointer-events-none z-20" />

                        {/* Technical Crosshairs (Alignment guides) */}
                        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-neutral-700/20 pointer-events-none z-20" />
                        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-neutral-700/20 pointer-events-none z-20" />

                        {/* 2.4x Zoom TShirtPreviewCard wrapper */}
                        <div className="absolute w-[280px] h-[280px] scale-[2.4] origin-center flex items-center justify-center pointer-events-none select-none z-15">
                          <TShirtPreviewCard
                            color={tshirtColor}
                            side={inspectSide}
                            elementsList={elements[inspectSide]}
                            size="small"
                          />
                        </div>
                      </div>

                      {/* Technical specifications tag absolute-placed below circle */}
                      <span className="absolute bottom-1 bg-[#B87D4C] text-black font-extrabold text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-full z-15 shadow-md">
                        250% HD Zoom Lens
                      </span>
                    </div>

                    {/* Specifications Verification Checklist */}
                    <div className="w-full mt-2 rounded-xl bg-neutral-950 p-4 border border-neutral-800 text-left">
                      <h4 className="text-xs font-bold text-neutral-300 mb-2 uppercase tracking-wide">Technical Specs Verification</h4>
                      <ul className="text-[10px] space-y-1.5 text-neutral-400 font-medium">
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>Spelling & typography alignment verified</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>Shapes scale & color matching verified</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>High-fidelity placement bounds checked</span>
                        </li>
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Footer confirmation buttons */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-end border-t border-neutral-800 pt-4 gap-4">
                  <button
                    onClick={() => setShowSaveConfirm(false)}
                    className="w-full sm:w-auto rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white px-6 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    Back to Editor
                  </button>
                  <button
                    onClick={handleFinalSave}
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#B87D4C] to-[#B87D4C] text-white px-7 py-2.5 text-xs font-bold transition-all hover:scale-[1.02] shadow-lg shadow-[#B87D4C]/30 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-4 w-4" /> Yes, Confirm & Save
                  </button>
                </div>

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AnimatePresence>
  );
}

// Simple custom Triangle component missing from standard lucide library
function TriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M13.73 3a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 20h16a2 2 0 0 0 1.73-3Z" />
    </svg>
  );
}
