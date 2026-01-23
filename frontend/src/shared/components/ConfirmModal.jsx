import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading, confirmText = "Confirm_Deletion", processingText = "Processing..." }) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
        setIsAnimating(true)
    } else {
        const timer = setTimeout(() => setIsAnimating(false), 200)
        return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen && !isAnimating) return null

  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className={`
        relative w-full max-w-md bg-surface border border-primary/20 p-6 
        shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all duration-200
        ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
      `}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-primary" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-primary" />

        <h3 className="text-xl font-bold font-mono text-primary mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="text-danger animate-pulse">⚠</span> {title}
        </h3>
        
        <p className="text-sm font-mono text-secondary mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-mono font-bold uppercase text-dim hover:text-white transition-colors border border-transparent hover:border-white/10"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 bg-danger/10 border border-danger text-danger hover:bg-danger hover:text-white transition-all text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
                <>
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {processingText}
                </>
            ) : (
                <>
                    {confirmText}
                    <span className="group-hover:translate-x-1 transition-transform">&gt;</span>
                </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ConfirmModal
