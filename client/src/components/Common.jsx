import React from 'react';

export function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ message = 'Nothing here yet.', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <p className="text-sm mb-4">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function StarRating({ value = 0 }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className="text-amber-500 text-sm">
      {'★'.repeat(Math.floor(rounded))}
      {rounded % 1 !== 0 ? '☆' : ''}
      <span className="text-gray-400 ml-1">({value.toFixed(1)})</span>
    </span>
  );
}

export function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="card p-6 max-w-sm w-full">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-outline text-sm py-2 px-4">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-primary text-sm py-2 px-4">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-56 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}
