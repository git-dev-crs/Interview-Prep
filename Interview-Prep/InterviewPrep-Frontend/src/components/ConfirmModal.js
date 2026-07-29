import React, { useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";

/**
 * ConfirmModal — reusable, dependency-free confirmation dialog styled for the
 * app's dark theme. Replaces the native window.confirm().
 *
 * Props:
 *   open          — whether the modal is visible
 *   title         — heading text
 *   message       — body text (string or node)
 *   confirmLabel  — confirm button text (default "Delete")
 *   cancelLabel   — cancel button text (default "Cancel")
 *   onConfirm     — called when the user confirms
 *   onCancel      — called on cancel / backdrop click / Escape
 *   isLoading     — disables buttons and shows a spinner on confirm
 *   danger        — red destructive styling (default true)
 */
const ConfirmModal = ({
    open,
    title = "Are you sure?",
    message,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
    danger = true,
}) => {
    // Close on Escape; lock body scroll while open.
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape" && !isLoading) onCancel?.();
        };
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, isLoading, onCancel]);

    if (!open) return null;

    const confirmClasses = danger
        ? "bg-red-500/90 hover:bg-red-500 text-white shadow-red-500/25"
        : "bg-gradient-to-r from-primary to-orange-600 text-primary-foreground shadow-primary/25";

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => !isLoading && onCancel?.()}
            />

            {/* Dialog */}
            <div className="relative w-full max-w-md p-6 rounded-2xl bg-card border border-border/60 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${danger ? "bg-red-500/10 text-red-400" : "bg-primary/10 text-primary"}`}>
                        <FaExclamationTriangle />
                    </div>
                    <div className="flex-1">
                        <h3 id="confirm-modal-title" className="text-lg font-bold text-foreground mb-1">
                            {title}
                        </h3>
                        {message && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-all disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all disabled:opacity-60 ${confirmClasses}`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Working...
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
