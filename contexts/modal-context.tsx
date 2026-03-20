'use client';

import { createContext, useContext, useState, useMemo, useCallback, ReactNode, lazy, Suspense } from 'react';

// Lazy load modals — they're rarely needed on initial render
const ContactFormModal = lazy(() =>
  import('@/components/modals/ContactFormModal').then(m => ({ default: m.ContactFormModal }))
);
const ComingSoonModal = lazy(() =>
  import('@/components/modals/ComingSoonModal').then(m => ({ default: m.ComingSoonModal }))
);

interface ModalContextType {
  openContactModal: () => void;
  openComingSoonModal: () => void;
  closeModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);

  const openContactModal = useCallback(() => setIsContactModalOpen(true), []);
  const openComingSoonModal = useCallback(() => setIsComingSoonModalOpen(true), []);
  const closeModals = useCallback(() => {
    setIsContactModalOpen(false);
    setIsComingSoonModalOpen(false);
  }, []);

  const handleContactClose = useCallback(() => setIsContactModalOpen(false), []);
  const handleComingSoonClose = useCallback(() => setIsComingSoonModalOpen(false), []);
  const handleComingSoonContactOpen = useCallback(() => {
    setIsComingSoonModalOpen(false);
    setTimeout(() => setIsContactModalOpen(true), 100);
  }, []);

  const value = useMemo(
    () => ({ openContactModal, openComingSoonModal, closeModals }),
    [openContactModal, openComingSoonModal, closeModals]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      {/* Only render modals when they've been opened at least once */}
      {isContactModalOpen && (
        <Suspense fallback={null}>
          <ContactFormModal isOpen={isContactModalOpen} onClose={handleContactClose} />
        </Suspense>
      )}
      {isComingSoonModalOpen && (
        <Suspense fallback={null}>
          <ComingSoonModal
            isOpen={isComingSoonModalOpen}
            onClose={handleComingSoonClose}
            onContactOpen={handleComingSoonContactOpen}
          />
        </Suspense>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}
