import React, { useState } from 'react';
import { Users, Megaphone, ShieldCheck, ArrowRight, ChevronLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnboardingView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: 'Build stronger communities',
      description: 'Discover local initiatives, community groups, and opportunities to contribute to lawful civic projects.',
      icon: Users,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      illustrationUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'Support meaningful initiatives',
      description: 'Join lawful campaigns, volunteer activities, educational programs, and local community events.',
      icon: Megaphone,
      color: 'bg-purple-50 text-purple-600 border-purple-100',
      illustrationUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'Participate safely and respectfully',
      description: 'Share ideas and organize activities while following community safety and anti-discrimination standards.',
      icon: ShieldCheck,
      color: 'bg-teal-50 text-teal-600 border-teal-100',
      illustrationUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800',
    },
  ];

  const currentSlide = slides[step];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      setCurrentView('register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => setCurrentView('login')}
          className="text-xs font-bold text-slate-500 hover:text-blue-600 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Illustration Area */}
      <div className="my-auto py-6 space-y-6 flex flex-col items-center text-center">
        <div className="relative w-full h-64 rounded-3xl overflow-hidden shadow-lg border border-slate-200 bg-white">
          <img
            src={currentSlide.illustrationUrl}
            alt={currentSlide.title}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-4">
            <div className={`p-3 rounded-2xl ${currentSlide.color} border shadow-md`}>
              <currentSlide.icon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="space-y-3 px-2">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">{currentSlide.title}</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">{currentSlide.description}</p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="space-y-6 pb-4">
        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleNext}
            className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {step === slides.length - 1 ? 'Get Started' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </button>

          {step === slides.length - 1 && (
            <p className="text-center text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <button onClick={() => setCurrentView('login')} className="text-blue-600 font-bold hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
