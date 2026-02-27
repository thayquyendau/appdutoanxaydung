import React, { useState, useEffect, useRef } from 'react';

interface OnboardingGuideProps {
  onComplete: () => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const STEPS = [
  {
    title: '📝 Điền thông tin công trình',
    description: 'Nhập kích thước (chiều rộng, chiều dài), chọn số tầng, loại móng, tầng hầm, sân thượng và mái để bắt đầu tính toán chi phí.',
    targetSelector: '.lg\\:col-span-4',
    tooltipPosition: 'right' as const,
  },
  {
    title: '📊 Xem kết quả dự toán',
    description: 'Kết quả dự toán sẽ tự động cập nhật khi bạn thay đổi thông số. Chọn gói thầu phù hợp và chỉnh sửa đơn giá theo thực tế.',
    targetSelector: '.lg\\:col-span-8',
    tooltipPosition: 'left' as const,
  },
];

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Calculate spotlight position for current step
  const updateSpotlight = () => {
    const currentStep = STEPS[step];
    const target = document.querySelector(currentStep.targetSelector);
    if (target) {
      const rect = target.getBoundingClientRect();
      const padding = 12;
      setSpotlight({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });
    }
  };

  // Initial mount: scroll to top and animate in
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Update spotlight when step changes
  useEffect(() => {
    updateSpotlight();
    const handleResize = () => updateSpotlight();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [step]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(step + 1);
        setIsTransitioning(false);
      }, 250);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(step - 1);
        setIsTransitioning(false);
      }, 250);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => onComplete(), 300);
  };

  const currentStep = STEPS[step];

  // Calculate tooltip position (fixed, viewport-relative)
  const getTooltipStyle = (): React.CSSProperties => {
    if (!spotlight) return { opacity: 0 };

    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
      return {
        position: 'fixed',
        top: spotlight.top + spotlight.height + 16,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'calc(100vw - 32px)',
      };
    }

    if (currentStep.tooltipPosition === 'right') {
      return {
        position: 'fixed',
        top: spotlight.top + 40,
        left: spotlight.left + spotlight.width + 20,
        maxWidth: '360px',
      };
    } else {
      return {
        position: 'fixed',
        top: spotlight.top + 40,
        right: window.innerWidth - spotlight.left + 20,
        maxWidth: '360px',
      };
    }
  };

  return (
    <div
      ref={overlayRef}
      className={`onboarding-overlay ${isVisible ? 'visible' : ''}`}
    >
      {/* Dark overlay with spotlight cutout using box-shadow */}
      {spotlight && (
        <div
          className="onboarding-spotlight"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className={`onboarding-tooltip ${isTransitioning ? 'transitioning' : ''}`}
        style={getTooltipStyle()}
      >
        {/* Step indicator */}
        <div className="onboarding-step-badge">
          Bước {step + 1}/{STEPS.length}
        </div>

        <h3 className="onboarding-title">{currentStep.title}</h3>
        <p className="onboarding-desc">{currentStep.description}</p>

        {/* Buttons */}
        <div className="onboarding-actions">
          <div className="onboarding-actions-left">
            {step > 0 && (
              <button
                onClick={handlePrev}
                className="onboarding-btn-secondary"
              >
                ← Quay lại
              </button>
            )}
            {step === 0 && (
              <button
                onClick={handleComplete}
                className="onboarding-btn-skip"
              >
                Bỏ qua
              </button>
            )}
          </div>
          <button
            onClick={handleNext}
            className="onboarding-btn-primary"
          >
            {step < STEPS.length - 1 ? 'Tiếp theo →' : '✓ Bắt đầu sử dụng'}
          </button>
        </div>

        {/* Dot indicators */}
        <div className="onboarding-dots">
          {STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`onboarding-dot ${idx === step ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
