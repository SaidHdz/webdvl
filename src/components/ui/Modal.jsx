import React from 'react';

/**
 * Reusable neo-brutalist modal. Renders a centered panel over a blurred overlay.
 * Closing is available via the overlay click and the corner button.
 *
 * @param {boolean} isOpen - Whether the modal is visible.
 * @param {() => void} onClose - Close handler.
 * @param {string} title - Heading text.
 * @param {string} [subtitle] - Optional small caption above the title.
 * @param {React.ReactNode} children - Modal body.
 * @param {React.ReactNode} [footer] - Optional footer (actions).
 */
const Modal = ({ isOpen, onClose, title, subtitle, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[500] p-6 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-dark-card border border-white/10 w-full max-w-2xl rounded-[40px] p-10 relative animate-slide-up shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 bg-white/5 hover:bg-red-500 hover:text-white text-white/40 w-11 h-11 flex items-center justify-center rounded-full transition-all border border-white/10 z-30"
                    aria-label="Cerrar"
                >
                    ✕
                </button>

                {/* Header is padded on the right so it never overlaps the close
                    button's hit area. */}
                <header className="mb-8 border-b border-white/5 pb-6 pr-16 relative z-10">
                    {subtitle && (
                        <p className="text-[10px] font-black uppercase tracking-[4px] text-neon-lime mb-2">{subtitle}</p>
                    )}
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-white">{title}</h2>
                </header>

                <div className="relative z-10 overflow-y-auto custom-scrollbar pr-1">{children}</div>

                {footer && <div className="relative z-10 mt-8 pt-6 border-t border-white/5 flex justify-end gap-3">{footer}</div>}
            </div>
        </div>
    );
};

export default Modal;
