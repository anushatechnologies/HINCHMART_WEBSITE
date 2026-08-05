"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardProvider, useWizard } from './WizardContext';
import { ArrowLeft, CheckCircle, Save, Send, ChevronRight } from 'lucide-react';

import Step1Category from './components/Step1Category';
import Step2ProductType from './components/Step2ProductType';
import Step3BasicInfo from './components/Step3BasicInfo';
import Step4Images from './components/Step4Images';
import Step5Specifications from './components/Step5Specifications';
import Step6RentalDetails from './components/Step6RentalDetails';
import Step7AvailabilityCalendar from './components/Step7AvailabilityCalendar';
import Step8RentalPricing from './components/Step8RentalPricing';
import Step9DepositPenalties from './components/Step9DepositPenalties';
import Step10DeliveryPickup from './components/Step10DeliveryPickup';
import Step11OperatorDetails from './components/Step11OperatorDetails';
import Step14Inventory from './components/Step14Inventory';
import Step16Review from './components/Step16Review';

const STEPS = [
  'Category', 'Product Type', 'Basic Information', 'Images & Media',
  'Specifications', 'Rental Details', 'Availability Calendar', 'Rental Pricing', 
  'Deposit & Penalties', 'Delivery & Pickup', 'Operator Details', 'Variants',
  'Pricing', 'Inventory', 'SEO', 'Review & Submit'
];

function WizardShell() {
  const router = useRouter();
  const { 
    currentStep, setCurrentStep, productType, 
    completedSteps, saveDraft, isSaving, markStepComplete
  } = useWizard();

  // Filter steps based on product type
  const activeSteps = STEPS.filter(step => {
    if (productType !== 'RENTAL' && [
      'Rental Details', 'Availability Calendar', 'Rental Pricing', 
      'Deposit & Penalties', 'Operator Details'
    ].includes(step)) return false;
    
    // For Rentals, hide standard Variants/Pricing for now (based on plan)
    if (productType === 'RENTAL' && ['Variants', 'Pricing'].includes(step)) return false;

    return true;
  });

  const currentStepName = activeSteps[currentStep - 1];

  const handleNext = async () => {
    markStepComplete(currentStep);
    await saveDraft();
    if (currentStep < activeSteps.length) {
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    } else {
      router.back();
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
            <p className="text-slate-500 text-sm">Step {currentStep} of {activeSteps.length}: {currentStepName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={saveDraft}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-sm"
          >
            {isSaving ? <span className="animate-spin text-xl leading-none">⟳</span> : <Save size={16} />}
            Save Draft
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden mt-6 gap-8">
        {/* Sidebar Navigation */}
        <div className="w-64 shrink-0 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-1">
            {activeSteps.map((stepName, idx) => {
              const stepNum = idx + 1;
              const isCurrent = stepNum === currentStep;
              const isCompleted = completedSteps.includes(stepNum);
              
              return (
                <button
                  key={stepName}
                  onClick={() => setCurrentStep(stepNum)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    isCurrent ? 'bg-red-50 border border-red-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted ? 'bg-emerald-500 text-white' : 
                      isCurrent ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isCompleted ? <CheckCircle size={14} /> : stepNum}
                    </div>
                    <span className={`text-sm font-medium ${isCurrent ? 'text-red-700' : 'text-slate-700'}`}>
                      {stepName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {currentStepName === 'Category' && <Step1Category />}
            {currentStepName === 'Product Type' && <Step2ProductType />}
            {currentStepName === 'Basic Information' && <Step3BasicInfo />}
            {currentStepName === 'Images & Media' && <Step4Images />}
            {currentStepName === 'Specifications' && <Step5Specifications />}
            {currentStepName === 'Rental Details' && <Step6RentalDetails />}
            {currentStepName === 'Availability Calendar' && <Step7AvailabilityCalendar />}
            {currentStepName === 'Rental Pricing' && <Step8RentalPricing />}
            {currentStepName === 'Deposit & Penalties' && <Step9DepositPenalties />}
            {currentStepName === 'Delivery & Pickup' && <Step10DeliveryPickup />}
            {currentStepName === 'Operator Details' && <Step11OperatorDetails />}
            {currentStepName === 'Inventory' && <Step14Inventory />}
            {currentStepName === 'Review & Submit' && <Step16Review />}
            
            {![
              'Category', 'Product Type', 'Basic Information', 'Images & Media', 
              'Specifications', 'Rental Details', 'Availability Calendar', 'Rental Pricing',
              'Deposit & Penalties', 'Delivery & Pickup', 'Operator Details',
              'Inventory', 'Review & Submit'
            ].includes(currentStepName) && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <p>Placeholder for <strong>{currentStepName}</strong> step.</p>
                <p className="text-sm mt-2">Implementation of individual steps happens in subsequent phases.</p>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button 
              onClick={handlePrev}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-white"
            >
              {currentStep === 1 ? 'Cancel' : 'Previous'}
            </button>
            <button 
              onClick={handleNext}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              {currentStep === activeSteps.length ? (
                <>Submit for Approval <Send size={16} /></>
              ) : (
                <>Save & Continue <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <WizardProvider>
      <WizardShell />
    </WizardProvider>
  );
}
