'use client';

import { useMemo } from 'react';
import { computeVerification, type ProfileFormState } from '@/lib/verification';

interface Props {
  formState: ProfileFormState;
  onVerify?: () => void;
  isVerified?: boolean;
}

export default function VerificationStatus({ formState, onVerify, isVerified }: Props) {
  const result = useMemo(() => computeVerification(formState), [formState]);

  const passedCount = result.checks.filter(c => c.passed).length;
  const totalCount = result.checks.length;

  return (
    <div className={`rounded-xl p-6 border ${isVerified ? 'bg-secondary-container/30 border-secondary/20' : 'bg-surface-container-lowest border-outline-variant/20'} shadow-[0px_4px_20px_rgba(15,23,42,0.04)]`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`rounded-full p-1.5 flex items-center justify-center ${isVerified ? 'bg-secondary text-on-secondary' : 'bg-surface-variant text-on-surface-variant'}`}>
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isVerified ? 'verified' : 'verified'}
          </span>
        </div>
        <div>
          <h4 className="font-label-md text-label-md font-bold text-on-surface">
            {isVerified ? 'Verified Profile' : 'Verification Status'}
          </h4>
          {isVerified && (
            <p className="font-label-sm text-label-sm text-secondary font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              All checks passed
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center font-label-sm text-label-sm">
          <span className="text-on-surface-variant">Progress</span>
          <span className={isVerified ? 'text-secondary font-bold' : 'text-on-surface-variant font-bold'}>{passedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${isVerified ? 'bg-secondary' : 'bg-secondary/60'}`}
            style={{ width: `${totalCount > 0 ? (passedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {result.checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 font-label-sm text-label-sm">
            <span
              className={`material-symbols-outlined text-[16px] ${check.passed ? 'text-secondary' : 'text-on-surface-variant/50'}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {check.passed ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            <span className={check.passed ? 'text-on-surface' : 'text-on-surface-variant/70'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {!isVerified && result.fullyVerified && onVerify && (
        <button
          onClick={onVerify}
          className="mt-4 w-full bg-secondary hover:bg-secondary/90 text-on-secondary rounded-lg px-4 py-2 font-label-md text-label-md transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          Mark as Verified
        </button>
      )}
    </div>
  );
}
