import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Loader2, ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { supabase } from '../../supabase';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({ isOpen, onClose }) => {

  const STEPS = [
    {
      id: 'name',
      label: 'Passo 1 de 9',
      question: 'Qual seu nome completo?',
      placeholder: 'Seu nome completo',
      type: 'text'
    },
    {
      id: 'age',
      label: 'Passo 2 de 9',
      question: 'Qual sua idade?',
      placeholder: 'Sua idade',
      type: 'number'
    },
    {
      id: 'phone',
      label: 'Passo 3 de 9',
      question: 'Qual seu telefone/WhatsApp?',
      placeholder: '(00) 00000-0000',
      type: 'tel'
    },
    {
      id: 'email',
      label: 'Passo 4 de 9',
      question: 'Qual seu melhor e-mail?',
      placeholder: 'nome@exemplo.com',
      type: 'email'
    },
    {
      id: 'address',
      label: 'Passo 5 de 9',
      question: 'Qual seu endereço?',
      placeholder: 'Rua, número, bairro, cidade',
      type: 'text'
    },
    {
      id: 'voting_location',
      label: 'Passo 6 de 9',
      question: 'Qual seu local de votação?',
      placeholder: 'Escola ou local onde você vota',
      type: 'text'
    },
    {
      id: 'instagram',
      label: 'Passo 7 de 9',
      question: 'Qual seu Instagram?',
      placeholder: '@seuusuario',
      type: 'text'
    },
    {
      id: 'referral',
      label: 'Passo 8 de 9',
      question: 'Como conheceu o DPE?',
      placeholder: 'Ex: Instagram, Amigo, Evento...',
      type: 'text'
    },
    {
      id: 'consent',
      label: 'Passo 9 de 9',
      question: 'Termos e Privacidade',
      placeholder: '',
      type: 'checkbox'
    }
  ];

  useEffect(() => {
    if (isOpen) gtag('event', 'membership_modal_open');
  }, [isOpen]);

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({
    name: '',
    age: '',
    phone: '',
    email: '',
    address: '',
    voting_location: '',
    instagram: '',
    referral: '',
    consent: false
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [direction, setDirection] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && status === 'idle' && STEPS[currentStep].type !== 'checkbox') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [currentStep, isOpen, status]);

  const handleNext = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const currentFieldId = STEPS[currentStep].id;
    const currentFieldValue = formData[currentFieldId];

    if (STEPS[currentStep].type === 'checkbox') {
      if (!currentFieldValue) return;
    } else if (!currentFieldValue || (typeof currentFieldValue === 'string' && currentFieldValue.trim() === '')) {
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    } else {
      submitForm();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitForm = async () => {
    setStatus('loading');

    try {
      const { error } = await supabase
        .from('inscritosparamembros_portaldpe')
        .insert({
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          voting_location: formData.voting_location,
          instagram: formData.instagram,
          referral: formData.referral,
          consent: formData.consent,
        });

      if (error) throw error;
      gtag('event', 'membership_form_submit', { success: true });
      setStatus('success');
    } catch (error) {
      console.error('Submission error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { type, checked, value } = e.target;
    setFormData({
      ...formData,
      [STEPS[currentStep].id]: type === 'checkbox' ? checked : value
    });
  };

  const progress = ((currentStep + 1) / (STEPS.length)) * 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[500px]"
          >
            {/* Progress Bar */}
            <div className="h-1.5 bg-slate-100 w-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-azure-600"
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex-1 flex flex-col px-8 md:px-12 py-12">
              {status === 'success' ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center animate-fade-in">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"
                  >
                    <Check size={40} />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">Cadastro Recebido!</h2>
                  <p className="text-slate-500 text-lg mb-8">Obrigado pelo seu interesse. Vamos avaliar o seu perfil e entraremos em contato em breve.</p>
                  <Button onClick={onClose} className="w-full">Explorar o Site</Button>
                </div>
              ) : (
                <form onSubmit={handleNext} className="flex-1 flex flex-col">
                  <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        <span className="text-azure-600 font-bold text-xs uppercase tracking-widest mb-4 block">
                          {STEPS[currentStep].label}
                        </span>
                        <h3 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">
                          {STEPS[currentStep].question}
                        </h3>
                        <p className="text-slate-500 mb-8">
                          {STEPS[currentStep].type === 'checkbox'
                            ? 'Precisamos da sua autorização para processar os dados.'
                            : 'Responda para continuar'}
                        </p>

                        {STEPS[currentStep].type === 'checkbox' ? (
                          <label className="flex items-start gap-4 cursor-pointer group bg-slate-50 p-6 rounded-2xl border-2 border-transparent focus-within:border-azure-600 transition-all">
                            <div className="relative flex items-center pt-1">
                              <input
                                type="checkbox"
                                checked={formData.consent}
                                onChange={handleInputChange}
                                className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-slate-300 transition-all checked:border-azure-600 checked:bg-azure-600"
                              />
                              <Check className="absolute h-6 w-6 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none p-1" />
                            </div>
                            <span className="text-sm text-slate-600 leading-relaxed">
                              Estou de acordo com a <strong>Política de Privacidade</strong> e autorizo o Portal DPE a tratar meus dados pessoais para fins de comunicação e mobilização, conforme a <strong>LGPD</strong>.
                            </span>
                          </label>
                        ) : (
                          <input
                            ref={inputRef}
                            required
                            type={STEPS[currentStep].type}
                            value={formData[STEPS[currentStep].id]}
                            onChange={handleInputChange}
                            placeholder={STEPS[currentStep].placeholder}
                            className="w-full bg-transparent border-b-2 border-slate-200 py-3 text-2xl text-slate-900 placeholder-slate-300 focus:border-azure-600 focus:outline-none transition-colors"
                            autoComplete="off"
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="mt-12 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={currentStep === 0 || status === 'loading'}
                      className={`text-sm font-semibold transition-colors ${currentStep === 0 ? 'opacity-0' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Voltar
                    </button>

                    <Button
                      type="submit"
                      isLoading={status === 'loading'}
                      disabled={
                        STEPS[currentStep].type === 'checkbox'
                          ? !formData.consent
                          : !formData[STEPS[currentStep].id].toString().trim()
                      }
                      className="!px-8"
                    >
                      {currentStep === STEPS.length - 1 ? 'Finalizar' : 'Continuar'}
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </div>

                  {status === 'error' && (
                    <p className="mt-4 text-center text-sm text-red-500 bg-red-50 py-2 rounded-lg">
                      Ocorreu um erro. Tente novamente.
                    </p>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};