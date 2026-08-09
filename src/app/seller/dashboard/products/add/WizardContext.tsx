"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type ProductWizardState = {
  productId: number | null;
  setProductId: (id: number | null) => void;
  currentStep: number;
  setCurrentStep: (step: number | ((prev: number) => number)) => void;
  completedSteps: number[];
  setCompletedSteps: (steps: number[]) => void;
  markStepComplete: (step: number) => void;
  productType: string;
  setProductType: (type: string) => void;
  formData: any;
  updateFormData: (data: any) => void;
  saveDraft: () => Promise<void>;
  isSaving: boolean;
};

const WizardContext = createContext<ProductWizardState | undefined>(undefined);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [productId, setProductId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [productType, setProductType] = useState('PHYSICAL');
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const updateFormData = (data: any) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.hinchmart.com';
      if (productId) {
        // Update existing draft
        await fetch(`${API}/api/vendors/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData) // In a real app, only send changed fields
        });
      } else {
        // Create new draft
        const vendorInfo = localStorage.getItem('seller_info');
        if (!vendorInfo) return;
        const vendorId = JSON.parse(vendorInfo).id;

        const res = await fetch(`${API}/api/vendors/products/draft`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            vendorId, 
            productType,
            categoryId: (formData as any).categoryId || 1 // fallback for now
          })
        });
        const data = await res.json();
        if (data.success) {
          setProductId(data.data.id);
        }
      }
    } catch (error) {
      console.error("Failed to save draft", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <WizardContext.Provider value={{
      productId, setProductId,
      currentStep, setCurrentStep,
      completedSteps, setCompletedSteps, markStepComplete,
      productType, setProductType,
      formData, updateFormData,
      saveDraft, isSaving
    }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
