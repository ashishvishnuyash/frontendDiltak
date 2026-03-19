'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ContactFormModal } from '@/components/modals/ContactFormModal';
import { ComingSoonModal } from '@/components/modals/ComingSoonModal';

interface ModalContextType {
  openContactModal: () => void;
  openComingSoonModal: () => void;
  closeModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState(false);

  const openContactModal = () => {
    setIsContactModalOpen(true);
  };

  const openComingSoonModal = () => {
    setIsComingSoonModalOpen(true);
  };

  const closeModals = () => {
    setIsContactModalOpen(false);
    setIsComingSoonModalOpen(false);
  };

  const handleContactClose = () => {
    setIsContactModalOpen(false);
  };

  const handleComingSoonClose = () => {
    setIsComingSoonModalOpen(false);
  };

  const handleComingSoonContactOpen = () => {
    setIsComingSoonModalOpen(false);
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setIsContactModalOpen(true);
    }, 100);
  };

  return (
    <ModalContext.Provider value={{ openContactModal, openComingSoonModal, closeModals }}>
      {children}
      
      <ContactFormModal 
        isOpen={isContactModalOpen} 
        onClose={handleContactClose} 
      />
      
      <ComingSoonModal 
        isOpen={isComingSoonModalOpen} 
        onClose={handleComingSoonClose}
        onContactOpen={handleComingSoonContactOpen}
      />
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
