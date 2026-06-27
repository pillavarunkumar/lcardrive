'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Instructor } from '@/types';
import { getAvatarUrl } from '@/lib/utils';

interface Props {
  instructor: Instructor;
  aiReason?: string;
  variant?: 'stacked' | 'horizontal';
  limitedSpots?: boolean;
}

function StarRating({ rating, size = 'text-[14px]' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`${size} ${i <= Math.round(rating) ? 'text-yellow-500' : 'text-gray-200'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function SaveButton({ instructorId }: { instructorId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('saved_instructors') || '[]');
    setSaved(stored.includes(instructorId));
  }, [instructorId]);

  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const stored = JSON.parse(localStorage.getItem('saved_instructors') || '[]');
    const updated = saved ? stored.filter((id: string) => id !== instructorId) : [...stored, instructorId];
    localStorage.setItem('saved_instructors', JSON.stringify(updated));
    setSaved(!saved);
  };

  return (
    <button
      onClick={toggleSave}
      className={`p-1.5 rounded-lg transition-all ${saved ? 'text-[#064E3B] bg-[#064E3B]/10' : 'text-gray-300 hover:text-[#064E3B] hover:bg-gray-100'}`}
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

export default function InstructorCard({ instructor, aiReason, variant = 'stacked', limitedSpots }: Props) {
  const fullName = `${instructor.first_name} ${instructor.last_name}`;
  const avatarUrl = getAvatarUrl(instructor);

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/instructors/${instructor.suburb.toLowerCase().replace(/\s+/g, '-')}/${instructor.slug}`}
        className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm hover:shadow-md hover:border-[#064E3B]/30 transition-all duration-200 flex flex-col relative group overflow-hidden"
      >
        <div className="flex gap-4 p-4">
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt=""
              className="w-16 h-16 rounded-xl object-cover border border-[#E5E7EB] shadow-sm"
            />
            {limitedSpots && (
              <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white px-1 py-0.5 rounded text-[8px] font-bold shadow-sm flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-gray-900 truncate">{fullName}</h2>
              {instructor.is_verified && (
                <svg className="w-4 h-4 text-[#064E3B] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StarRating rating={instructor.average_rating} size="w-3 h-3" />
              <span className="text-xs font-semibold text-gray-900">{instructor.average_rating.toFixed(1)}</span>
              <span className="text-[11px] text-[#64748B]">({instructor.review_count})</span>
            </div>
            <div className="flex items-center gap-1 text-[#64748B] text-xs mt-0.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate">{instructor.suburb}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <SaveButton instructorId={instructor.id} />
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-1">
            {instructor.transmission && (
              <span className="px-2 py-0.5 bg-gray-100 text-[#64748B] rounded text-[11px] font-medium">
                {instructor.transmission === 'auto' ? 'Auto' : instructor.transmission === 'manual' ? 'Manual' : 'Auto & Manual'}
              </span>
            )}
            {instructor.specialises_anxiety && (
              <span className="px-2 py-0.5 bg-[#064E3B]/5 text-[#064E3B] rounded text-[11px] font-medium">Anxiety Friendly</span>
            )}
            {instructor.accepts_international && (
              <span className="px-2 py-0.5 bg-[#064E3B]/5 text-[#064E3B] rounded text-[11px] font-medium">Intl. Licence</span>
            )}
          </div>
          {aiReason && (
            <div className="bg-[#064E3B]/5 border-l-[3px] border-[#064E3B] rounded-r-lg p-2.5 mt-2">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="material-symbols-outlined text-[#064E3B] text-[14px]">psychology</span>
                <span className="text-[11px] font-bold text-gray-900">Why this match?</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-snug">{aiReason}</p>
            </div>
          )}
        </div>
        <div className="mt-auto px-4 pb-4 pt-3 border-t border-[#E5E7EB] flex justify-between items-center">
          <div>
            <span className="text-[10px] text-[#64748B] block leading-none mb-0.5">Starting from</span>
            <span className="text-base font-bold text-gray-900">
              ${instructor.hourly_rate}<span className="text-xs font-normal text-[#64748B]">/hr</span>
            </span>
          </div>
          <span className="bg-[#064E3B] text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-sm group-hover:shadow-md transition-all">
            View Profile
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/instructors/${instructor.suburb.toLowerCase().replace(/\s+/g, '-')}/${instructor.slug}`}
      className="bg-white border border-[#E5E7EB] rounded-[20px] shadow-sm hover:shadow-md hover:border-[#064E3B]/30 transition-all duration-300 group block"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <img
                src={avatarUrl}
                alt={instructor.first_name}
                className="w-14 h-14 rounded-xl object-cover border border-[#E5E7EB] shadow-sm"
              />
              {limitedSpots && (
                <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white px-1 py-0.5 rounded text-[8px] font-bold shadow-sm flex items-center gap-0.5">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32-3.03 2.46-4.67 6.05-4.67 9.93 0 3.29 1.65 6.18 4.12 7.75-.77-1.08-1.17-2.37-1.17-3.7 0-2.19 1.09-4.16 2.75-5.41.58-.44 1.23-.77 1.85-1.15l.02-.01c.83-.52 1.72-1.12 2.32-1.93Z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-gray-900 truncate">{fullName}</h3>
                {instructor.is_verified && (
                  <svg className="w-4 h-4 text-[#064E3B] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                )}
              </div>
              <p className="text-xs text-[#64748B] mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {instructor.suburb} &bull; {instructor.service_radius_km}km
              </p>
            </div>
          </div>
          <SaveButton instructorId={instructor.id} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={instructor.average_rating} size="w-4 h-4" />
          <span className="text-sm font-bold text-gray-900">{instructor.average_rating.toFixed(1)}</span>
          <span className="text-xs text-[#64748B]">({instructor.review_count})</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {instructor.transmission && (
            <span className="text-[11px] font-medium bg-gray-100 text-[#64748B] px-2 py-0.5 rounded capitalize">
              {instructor.transmission === 'both' ? 'Auto & Manual' : instructor.transmission}
            </span>
          )}
          {instructor.specialises_anxiety && (
            <span className="text-[11px] font-medium bg-[#064E3B]/5 text-[#064E3B] px-2 py-0.5 rounded">Anxiety-friendly</span>
          )}
          {instructor.accepts_international && (
            <span className="text-[11px] font-medium bg-[#064E3B]/5 text-[#064E3B] px-2 py-0.5 rounded">Intl. Licence</span>
          )}
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed mb-4 line-clamp-2">
          {instructor.bio || `${instructor.first_name} is a driving instructor serving the ${instructor.suburb} area.`}
        </p>

        {aiReason && (
          <div className="bg-[#064E3B]/5 border-l-[3px] border-[#064E3B] rounded-r-lg p-3 mb-4">
            <span className="flex items-center gap-1 text-xs font-bold text-gray-900 mb-1">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              Why this match?
            </span>
            <p className="text-xs text-[#64748B] leading-snug">{aiReason}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
          <div>
            {instructor.hourly_rate && (
              <>
                <span className="text-lg font-bold text-gray-900">${instructor.hourly_rate}</span>
                <span className="text-xs text-[#64748B]">/hr</span>
              </>
            )}
          </div>
          <span className="bg-[#064E3B] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all group-hover:bg-[#053A2C]">
            Book Now
          </span>
        </div>
      </div>
    </Link>
  );
}
