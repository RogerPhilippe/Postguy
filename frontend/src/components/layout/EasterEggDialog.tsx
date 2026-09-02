import React, { useEffect, useState } from 'react';

interface EasterEggDialogProps {
  open: boolean;
  onClose: () => void;
}

export function EasterEggDialog({ open, onClose }: EasterEggDialogProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    import('../../assets/iconAssets').then((mod) => {
      if (!cancelled) setSrc(`data:image/png;base64,${mod.ICON_DATA}`);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
    >
      {src && (
        <img
          src={src}
          alt=""
          className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}