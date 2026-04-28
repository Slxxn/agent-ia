import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Types
interface SheetContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextType>({
  open: false,
  setOpen: () => {},
});

export const useSheet = () => useContext(SheetContext);

// Sheet Root
interface SheetProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Sheet: React.FC<SheetProps> = ({ children, open: controlledOpen, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

export default Sheet;

// SheetTrigger
interface SheetTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const SheetTrigger: React.FC<SheetTriggerProps> = ({ children, asChild = false }) => {
  const { setOpen } = useSheet();
  const handleClick = () => setOpen(true);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        handleClick();
      },
    });
  }

  return (
    <button onClick={handleClick} type="button" className="inline-flex items-center justify-center">
      {children}
    </button>
  );
};

// SheetContent
interface SheetContentProps {
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export const SheetContent: React.FC<SheetContentProps> = ({ children, side = 'right' }) => {
  const { open, setOpen } = useSheet();
  const overlayRef = useRef<HTMLDivElement>(null);

  const sideVariants = {
    right: { x: '100%' },
    left: { x: '-100%' },
    top: { y: '-100%' },
    bottom: { y: '100%' },
  };

  const sideEnterVariants = {
    right: { x: 0 },
    left: { x: 0 },
    top: { y: 0 },
    bottom: { y: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex" style={{ justifyContent: side === 'right' ? 'flex-end' : side === 'left' ? 'flex-start' : 'center', alignItems: side === 'top' ? 'flex-start' : side === 'bottom' ? 'flex-end' : 'center' }}>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black"
            onClick={() => setOpen(false)}
          />
          {/* Sheet Panel */}
          <motion.div
            initial={sideVariants[side]}
            animate={sideEnterVariants[side]}
            exit={sideVariants[side]}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`relative bg-white shadow-2xl overflow-y-auto ${
              side === 'left' || side === 'right' ? 'h-full w-full max-w-md' : 'w-full h-80'
            }`}
          >
            <div className="p-6">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// SheetHeader
interface SheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const SheetHeader: React.FC<SheetHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  );
};

// SheetTitle
interface SheetTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const SheetTitle: React.FC<SheetTitleProps> = ({ children, className = '' }) => {
  return (
    <h2 className={`text-2xl font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
};

// SheetDescription (optionnel mais utile)
interface SheetDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const SheetDescription: React.FC<SheetDescriptionProps> = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
      {children}
    </p>
  );
};