import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComponentId, BuildComponent } from '../types';
import { COMPONENTS } from '../data/scenario1';

interface Props {
  onTest: (placed: ComponentId[]) => void;
  onBack: () => void;
}

interface PlacedItem {
  slotId: string;
  componentId: ComponentId;
}

const SLOTS = [
  { id: 'slot-1', label: 'Spot A' },
  { id: 'slot-2', label: 'Spot B' },
  { id: 'slot-3', label: 'Spot C' },
];

function buildSummary(placed: PlacedItem[]): string {
  const ids = placed.map(p => p.componentId);
  const hasMega = ids.includes('mega-machine');
  const extraCount = ids.filter(id => id.startsWith('extra-machine')).length;
  const hasDirector = ids.includes('traffic-director');

  if (placed.length === 0) return '';
  if (hasMega && extraCount === 0) return '⚡ One powerful machine — vertical scaling';
  if (extraCount >= 2 && hasDirector) return '🏆 Two machines + traffic director — load balanced!';
  if (extraCount >= 2) return '🎵 Two machines, no coordinator — uneven traffic';
  if (extraCount === 1) return '🎵 One extra machine added';
  return '';
}

export default function BuildPhase({ onTest, onBack }: Props) {
  const [placed, setPlaced] = useState<PlacedItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredTrayId, setHoveredTrayId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const placedIds = placed.map(p => p.componentId);
  const hasMega = placedIds.includes('mega-machine');
  const extraCount = placedIds.filter(id => id.startsWith('extra-machine')).length;
  const hasDirector = placedIds.includes('traffic-director');

  function isDisabled(id: ComponentId): boolean {
    // Already placed
    if (placedIds.includes(id)) return true;
    // Can't mix mega with extra machines
    if (id === 'mega-machine' && extraCount > 0) return true;
    if (id.startsWith('extra-machine') && hasMega) return true;
    // Traffic director only makes sense with extra machines; also can't duplicate
    if (id === 'traffic-director' && extraCount < 2) return true;
    if (id === 'traffic-director' && hasDirector) return true;
    return false;
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && SLOTS.some(s => s.id === over.id)) {
      const componentId = active.data.current?.componentId as ComponentId;
      const slotId = over.id as string;

      // Slot must be empty
      if (placed.find(p => p.slotId === slotId)) {
        setActiveId(null);
        return;
      }
      if (isDisabled(componentId)) {
        setActiveId(null);
        return;
      }

      setPlaced(prev => [...prev, { slotId, componentId }]);
    }
    setActiveId(null);
  }

  function removeFromSlot(slotId: string) {
    setPlaced(prev => prev.filter(p => p.slotId !== slotId));
  }

  function clearBoard() {
    setPlaced([]);
  }

  const activeComponent = activeId
    ? COMPONENTS.find(c => `tray-${c.id}` === activeId)
    : null;

  const summary = buildSummary(placed);
  const canTest = placed.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer text-sm"
          >
            ← Back
          </button>
          <span className="text-gray-200">|</span>
          <span className="text-lg">🏗️</span>
          <div>
            <div className="font-black text-gray-900 text-sm">Workshop</div>
            <div className="text-xs text-gray-400">Build Spotify</div>
          </div>
        </div>
        <div className="bg-violet-100 text-violet-700 font-bold text-xs px-4 py-1.5 rounded-full border border-violet-200">
          Scenario 1 of 5
        </div>
      </div>

      {/* Mission banner */}
      <div className="bg-violet-600 text-white text-center py-2.5 text-sm font-semibold">
        Mission: Your music machine can't handle the crowd. Upgrade your setup.
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-5 p-5 overflow-hidden">
          {/* Left — listener sidebar */}
          <div className="w-44 shrink-0 bg-white rounded-3xl p-4 shadow-md border border-gray-100 flex flex-col">
            <h3 className="font-bold text-gray-600 text-xs uppercase tracking-wider mb-3">
              👥 40 Listeners
            </h3>
            <div className="grid grid-cols-5 gap-1 overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="text-sm">
                  👦
                </div>
              ))}
            </div>
            <div className="mt-auto pt-3 border-t border-gray-100 space-y-1.5 text-xs">
              <div className="flex items-center gap-1 text-red-600 font-semibold">
                <motion.div
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                  className="w-1.5 h-1.5 rounded-full bg-red-500"
                />
                Waiting for songs
              </div>
              <div className="text-gray-400">Current load: High 🔴</div>
            </div>
          </div>

          {/* Center — workshop board */}
          <div className="flex-1 flex flex-col">
            <div className="text-center mb-4">
              <h2 className="font-black text-gray-800 text-xl">Workshop Board</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Drag components from the tray into the spots below
              </p>
            </div>

            {/* Drop slots */}
            <div className="flex gap-4 justify-center items-center flex-1">
              {SLOTS.map(slot => {
                const item = placed.find(p => p.slotId === slot.id);
                const component = item ? COMPONENTS.find(c => c.id === item.componentId) : null;
                return (
                  <BoardSlot
                    key={slot.id}
                    slotId={slot.id}
                    label={slot.label}
                    component={component ?? null}
                    onRemove={() => removeFromSlot(slot.id)}
                  />
                );
              })}
            </div>

            {/* Build summary */}
            <div className="mt-4 min-h-10 flex justify-center">
              <AnimatePresence>
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="bg-white border border-gray-200 rounded-2xl px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm"
                  >
                    {summary}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-3 mt-4">
              {placed.length > 0 && (
                <button
                  onClick={clearBoard}
                  className="text-gray-400 hover:text-gray-600 text-sm font-medium cursor-pointer transition-colors underline underline-offset-2"
                >
                  Clear board
                </button>
              )}
              <button
                onClick={() => canTest && onTest(placedIds)}
                disabled={!canTest}
                className={`font-bold text-lg px-10 py-4 rounded-2xl shadow-lg transition-all cursor-pointer ${
                  canTest
                    ? 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 hover:shadow-green-200 shadow-green-100 active:scale-[0.98]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {canTest ? 'Test My Build 🚀' : 'Add a component to test'}
              </button>
            </div>
          </div>

          {/* Right — component tray */}
          <div className="w-64 shrink-0 bg-white rounded-3xl p-4 shadow-md border border-gray-100 flex flex-col overflow-y-auto">
            <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-0.5">
              🧰 Component Tray
            </h3>
            <p className="text-xs text-gray-400 mb-4">Drag components to the workshop board</p>

            <div className="space-y-3">
              {COMPONENTS.map(component => (
                <TrayItem
                  key={component.id}
                  component={component}
                  disabled={isDisabled(component.id)}
                  showTooltip={hoveredTrayId === component.id}
                  onMouseEnter={() => setHoveredTrayId(component.id)}
                  onMouseLeave={() => setHoveredTrayId(null)}
                />
              ))}
            </div>

            {/* Combo guide */}
            <div className="mt-auto pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                Valid builds:
              </p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-start gap-1.5">
                  <span>⚡</span>
                  <span>Mega only → vertical scale</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span>🎵🎵</span>
                  <span>Two extras → horizontal scale</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span>🎵🎵 + 🤖</span>
                  <span>Two extras + director → load balanced</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={null}>
          {activeComponent && (
            <div
              className={`${activeComponent.bgColor} border-2 ${activeComponent.borderColor} rounded-2xl p-3 shadow-2xl w-56 rotate-3 opacity-95`}
            >
              <div className="text-2xl mb-1">{activeComponent.emoji}</div>
              <div className={`font-bold text-sm ${activeComponent.textColor}`}>
                {activeComponent.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{activeComponent.gameDescription}</div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TrayItem({
  component,
  disabled,
  showTooltip,
  onMouseEnter,
  onMouseLeave,
}: {
  component: BuildComponent;
  disabled: boolean;
  showTooltip: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `tray-${component.id}`,
    data: { componentId: component.id },
    disabled,
  });

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={`rounded-2xl p-3 border-2 transition-all select-none ${
          isDragging
            ? 'opacity-30'
            : disabled
            ? `bg-gray-50 border-gray-200 opacity-40 cursor-not-allowed`
            : `${component.bgColor} ${component.borderColor} cursor-grab hover:shadow-md hover:scale-[1.02] active:cursor-grabbing`
        }`}
      >
        <div className="flex items-start gap-2.5">
          <span className="text-2xl leading-none mt-0.5">{component.emoji}</span>
          <div className="flex-1 min-w-0">
            <div
              className={`font-bold text-sm leading-tight ${
                disabled ? 'text-gray-400' : component.textColor
              }`}
            >
              {component.name}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 leading-snug">
              {component.gameDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip on hover */}
      <AnimatePresence>
        {showTooltip && !disabled && !isDragging && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className="absolute left-full top-0 ml-3 bg-gray-900 text-white rounded-2xl p-3 w-52 z-20 shadow-2xl pointer-events-none"
          >
            <div className="text-xs font-bold text-gray-300 mb-1 uppercase tracking-wider">
              System Design
            </div>
            <div className="text-sm leading-snug">{component.systemDescription}</div>
            {/* Arrow */}
            <div className="absolute right-full top-4 border-4 border-transparent border-r-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Disabled hint */}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {component.id === 'traffic-director' && (
            <div className="bg-gray-800/80 text-white text-xs rounded-xl px-2 py-1">
              Add 2 machines first
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BoardSlot({
  slotId,
  label,
  component,
  onRemove,
}: {
  slotId: string;
  label: string;
  component: BuildComponent | null;
  onRemove: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  return (
    <motion.div
      ref={setNodeRef}
      layout
      className={`w-44 h-56 rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center relative ${
        component
          ? `${component.bgColor} ${component.borderColor} border-solid shadow-lg`
          : isOver
          ? 'bg-violet-50 border-violet-400 shadow-md shadow-violet-100'
          : 'bg-white/70 border-gray-300 hover:border-gray-400'
      }`}
    >
      {component ? (
        <div className="flex flex-col items-center justify-center p-4 text-center w-full h-full">
          {/* Remove button */}
          <button
            onClick={onRemove}
            className="absolute top-2.5 right-2.5 w-6 h-6 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 text-gray-500 hover:text-red-600 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer shadow-sm"
          >
            ×
          </button>

          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-5xl mb-3"
          >
            {component.emoji}
          </motion.div>
          <div className={`font-bold text-sm ${component.textColor} leading-tight`}>
            {component.name}
          </div>
          <div className="text-xs text-gray-500 mt-1 leading-snug px-1">
            {component.gameDescription}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 select-none">
          <div className={`text-3xl mb-2 transition-transform ${isOver ? 'scale-110' : ''}`}>
            {isOver ? '✨' : '＋'}
          </div>
          <div className="text-xs font-semibold">{label}</div>
          <div className="text-xs mt-0.5 text-gray-300">Drop here</div>
        </div>
      )}
    </motion.div>
  );
}
