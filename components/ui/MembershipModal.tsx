import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, Sparkles, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define the steps structure
const STEPS = [
  {
    id: 'name',
    label: 'IDENTITY',
    question: "What should we call you?",
    placeholder: "Enter your full name",
    type: 'text'
  },
  {
    id: 'email',
    label: 'COMM_LINK',
    question: "Where should we send the access key?",
    placeholder: "name@example.com",
    type: 'email'
  },
  {
    id: 'role',
    label: 'CLASS',
    question: "What is your primary specialization?",
    placeholder: "e.g. Frontend Architect, UI Designer...",
    type: 'text'
  },
  {
    id: 'experience',
    label: 'LEVEL',
    question: "How long have you been in the field?",
    placeholder: "e.g. 5 years, Just started...",
    type: 'text'
  },
  {
    id: 'stack',
    label: 'WEAPON',
    question: "What is your preferred tech stack?",
    placeholder: "e.g. React, Rust, Go...",
    type: 'text'
  }
];

export const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    email: '',
    role: '',
    experience: '',
    stack: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on step change
  useEffect(() => {
    if (isOpen && status === 'idle') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Wait for animation
    }
  }, [currentStep, isOpen, status]);

  const handleNext = async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validate current field
    const currentFieldId = STEPS[currentStep].id;
    if (!formData[currentFieldId] || formData[currentFieldId].trim() === '') return;

    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitForm = async () => {
    setStatus('loading');

    try {
      await fetch('https://n8n.lunarlaunch.com.br/webhook/5a88ea7a-19ce-4a92-b7a6-2a1caf24d6ed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          source: 'luxtech_blog_membership',
          timestamp: new Date().toISOString()
        }),
      });

      setStatus('success');
      setTimeout(() => {
        onClose();
        // Reset after close animation
        setTimeout(() => {
          setStatus('idle');
          setCurrentStep(0);
          setFormData({ name: '', email: '', role: '', experience: '', stack: '' });
        }, 500);
      }, 3000);

    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [STEPS[currentStep].id]: e.target.value
    });
  };

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#050505] shadow-2xl flex flex-col min-h-[400px]"
            >
              {/* Decorative Glows */}
              <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 rounded-full p-1.5 text-text-muted hover:bg-white/5 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              {status === 'success' ? (
                <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-success border border-success/30 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]"
                  >
                    <Check size={40} />
                  </motion.div>
                  <h2 className="mb-2 font-display text-3xl font-bold text-white">Access Granted</h2>
                  <p className="text-text-muted font-body">Welcome to the inner circle.</p>
                </div>
              ) : (
                <div className="flex flex-1 flex-col pt-16 pb-8 px-6 md:p-12">
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
                        <Sparkles size={12} className="text-primary" />
                        <span className="font-mono text-[10px] font-medium tracking-widest text-primary uppercase">
                          Protocol Initiation
                        </span>
                      </div>
                      <span className="font-mono text-xs text-text-muted">
                        STEP {currentStep + 1} / {STEPS.length}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>

                  {/* Form Step - AnimatePresence handles the slide transition */}
                  <form onSubmit={handleNext} className="flex-1 flex flex-col relative">
                    <div className="flex-1 flex items-center">
                      <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                          key={currentStep}
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          className="w-full"
                        >
                          <label className="block font-mono text-xs text-primary mb-2 tracking-widest">
                            {`// ${STEPS[currentStep].label}`}
                          </label>
                          <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
                            {STEPS[currentStep].question}
                          </h3>
                          <input
                            ref={inputRef}
                            required
                            type={STEPS[currentStep].type}
                            value={formData[STEPS[currentStep].id]}
                            onChange={handleInputChange}
                            placeholder={STEPS[currentStep].placeholder}
                            className="w-full bg-transparent border-b border-white/20 py-3 font-body text-xl md:text-2xl text-white placeholder-white/20 focus:border-primary focus:outline-none transition-colors"
                            autoComplete="off"
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={currentStep === 0 || status === 'loading'}
                        className={`flex items-center gap-2 text-sm font-mono transition-colors ${currentStep === 0 ? 'text-white/10 cursor-not-allowed' : 'text-text-muted hover:text-white'}`}
                      >
                        <ChevronLeft size={16} />
                        BACK
                      </button>

                      <Button
                        type="submit"
                        disabled={status === 'loading'}
                        className="!px-6 group"
                      >
                        {status === 'loading' ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            {currentStep === STEPS.length - 1 ? 'FINISH' : 'NEXT'}
                            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Enter Hint */}
                    <div className="absolute bottom-[-20px] right-0 hidden md:block">
                      <span className="text-[10px] font-mono text-white/20">PRESS ENTER ↵</span>
                    </div>

                    {status === 'error' && (
                      <p className="absolute bottom-[-30px] left-0 text-xs text-red-400 font-mono">
                        ERROR: Connection failed. Please try again.
                      </p>
                    )}
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};