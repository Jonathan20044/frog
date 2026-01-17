import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, HelpCircle, Lightbulb } from 'lucide-react';

export interface GuideStep {
  title: string;
  description: string;
  target?: string; // ID del elemento a resaltar
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface InteractiveGuideProps {
  steps: GuideStep[];
  onComplete: () => void;
  pageName: string;
}

export default function InteractiveGuide({ steps, onComplete, pageName }: InteractiveGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || steps.length === 0) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Scroll automático al elemento cuando cambia el paso
  useEffect(() => {
    if (step.target) {
      const element = document.getElementById(step.target);
      if (element) {
        // Hacer scroll suave al elemento
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    } else {
      // Si no hay target, scroll al tope
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, step.target]);

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    onComplete();
  };

  // Obtener posición del tooltip basado en el target
  const getTooltipPosition = () => {
    if (!step.target) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const element = document.getElementById(step.target);
    if (!element) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const rect = element.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    switch (step.position) {
      case 'top':
        return {
          top: `${rect.top + scrollY - 20}px`,
          left: `${rect.left + scrollX + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: `${rect.bottom + scrollY + 20}px`,
          left: `${rect.left + scrollX + rect.width / 2}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: `${rect.top + scrollY + rect.height / 2}px`,
          left: `${rect.left + scrollX - 20}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: `${rect.top + scrollY + rect.height / 2}px`,
          left: `${rect.right + scrollX + 20}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  const tooltipStyle = step.target ? getTooltipPosition() : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  return (
    <>
      {/* Overlay con recorte para el elemento target */}
      {step.target && (() => {
        const element = document.getElementById(step.target);
        if (!element) {
          return <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] backdrop-blur-sm" onClick={handleClose}></div>;
        }
        
        const rect = element.getBoundingClientRect();
        const padding = 12;
        
        return (
          <>
            {/* Overlay dividido en 4 partes para crear el efecto de recorte */}
            {/* Top */}
            <div 
              className="fixed left-0 right-0 bg-black bg-opacity-60 z-[100] backdrop-blur-sm"
              style={{
                top: 0,
                height: `${Math.max(0, rect.top - padding)}px`
              }}
              onClick={handleClose}
            ></div>
            
            {/* Bottom */}
            <div 
              className="fixed left-0 right-0 bg-black bg-opacity-60 z-[100] backdrop-blur-sm"
              style={{
                top: `${rect.bottom + padding}px`,
                bottom: 0
              }}
              onClick={handleClose}
            ></div>
            
            {/* Left */}
            <div 
              className="fixed bg-black bg-opacity-60 z-[100] backdrop-blur-sm"
              style={{
                top: `${rect.top - padding}px`,
                left: 0,
                width: `${Math.max(0, rect.left - padding)}px`,
                height: `${rect.height + padding * 2}px`
              }}
              onClick={handleClose}
            ></div>
            
            {/* Right */}
            <div 
              className="fixed bg-black bg-opacity-60 z-[100] backdrop-blur-sm"
              style={{
                top: `${rect.top - padding}px`,
                left: `${rect.right + padding}px`,
                right: 0,
                height: `${rect.height + padding * 2}px`
              }}
              onClick={handleClose}
            ></div>
          </>
        );
      })()}
      
      {/* Overlay simple cuando no hay target */}
      {!step.target && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] backdrop-blur-sm" onClick={handleClose}></div>
      )}

      {/* Resaltado del elemento target */}
      {step.target && (() => {
        const element = document.getElementById(step.target);
        if (!element) return null;
        
        const rect = element.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        
        return (
          <div
            className="fixed z-[101] pointer-events-none"
            style={{
              top: `${rect.top + scrollY - 8}px`,
              left: `${rect.left + scrollX - 8}px`,
              width: `${rect.width + 16}px`,
              height: `${rect.height + 16}px`,
              border: '4px solid rgb(6, 182, 212)',
              borderRadius: '12px',
              boxShadow: '0 0 0 4px rgba(6, 182, 212, 0.3), 0 0 30px rgba(6, 182, 212, 0.6)',
              animation: 'pulse 2s infinite',
            }}
          />
        );
      })()}

      {/* Tooltip de la guía */}
      <div
        className="fixed z-[102] w-full max-w-md"
        style={tooltipStyle}
      >
        <div className="bg-gradient-to-br from-white to-cyan-50 rounded-2xl shadow-2xl border-4 border-cyan-500 p-6 relative animate-fadeIn">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{step.title}</h3>
                <p className="text-xs text-cyan-600 font-semibold">{pageName} - Paso {currentStep + 1}/{steps.length}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <p className="text-slate-700 leading-relaxed">{step.description}</p>
          </div>

          {/* Progreso */}
          <div className="mb-4">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    index <= currentStep
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                isFirstStep
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition-all"
            >
              {isLastStep ? 'Finalizar' : 'Siguiente'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Botón para saltar tutorial */}
          <button
            onClick={handleClose}
            className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Saltar tutorial
          </button>
        </div>

        {/* Flecha apuntando al elemento (solo si hay target) */}
        {step.target && step.position !== 'center' && (
          <div
            className={`absolute w-0 h-0 ${
              step.position === 'top'
                ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-cyan-500'
                : step.position === 'bottom'
                ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-cyan-500'
                : step.position === 'left'
                ? 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-cyan-500'
                : 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-r-[12px] border-r-cyan-500'
            }`}
          />
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.3), 0 0 30px rgba(6, 182, 212, 0.6);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(6, 182, 212, 0.2), 0 0 40px rgba(6, 182, 212, 0.8);
          }
        }
      `}</style>
    </>
  );
}

// Componente del botón de ayuda
export function GuideButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      title="Ver guía interactiva"
    >
      <HelpCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white animate-ping"></span>
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white"></span>
    </button>
  );
}
