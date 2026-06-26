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
        <span
          key={i}
          className={`material-symbols-outlined ${size} ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
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
      className="text-gray-300 hover:text-[#064E3B] transition-colors"
    >
      <span
        className={`material-symbols-outlined text-xl ${saved ? 'text-[#064E3B]' : ''}`}
        style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
      >
        bookmark
      </span>
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
        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#064E3B]/20 transition-all duration-200 flex flex-col relative group overflow-hidden"
      >
        <div className="flex gap-4 p-4">
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt=""
              className="w-16 h-16 rounded-xl object-cover border border-gray-100 shadow-sm"
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
                <span className="material-symbols-outlined text-[#064E3B] text-[16px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StarRating rating={instructor.average_rating} size="text-[12px]" />
              <span className="text-xs font-semibold text-gray-900">{instructor.average_rating.toFixed(1)}</span>
              <span className="text-[11px] text-gray-400">({instructor.review_count})</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
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
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[11px] font-medium">
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
              <p className="text-[11px] text-gray-500 leading-snug">{aiReason}</p>
            </div>
          )}
        </div>
        <div className="mt-auto px-4 pb-4 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-gray-400 block leading-none mb-0.5">Starting from</span>
            <span className="text-base font-bold text-gray-900">
              ${instructor.hourly_rate}<span className="text-xs font-normal text-gray-400">/hr</span>
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
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#064E3B]/20 transition-all duration-300 group block"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={avatarUrl}
          alt={instructor.first_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 right-3 z-10">
          <SaveButton instructorId={instructor.id} />
        </div>
        {limitedSpots && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-amber-500/30">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            Limited Spots
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-bold text-gray-900 truncate">{fullName}</h3>
              {instructor.is_verified && (
                <span className="material-symbols-outlined text-[#064E3B] text-[18px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              {instructor.suburb} • {instructor.service_radius_km}km
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={instructor.average_rating} size="text-[16px]" />
          <span className="text-sm font-bold text-gray-900">{instructor.average_rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400">({instructor.review_count})</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {instructor.transmission && (
            <span className="text-[11px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded capitalize">
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
        <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
          {instructor.bio || `${instructor.first_name} is a driving instructor serving the ${instructor.suburb} area.`}
        </p>
        {aiReason && (
          <div className="bg-[#064E3B]/5 border-l-[3px] border-[#064E3B] rounded-r-lg p-3 mb-4">
            <span className="flex items-center gap-1 text-xs font-bold text-gray-900 mb-1">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              Why this match?
            </span>
            <p className="text-xs text-gray-500 leading-snug">{aiReason}</p>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            {instructor.hourly_rate && (
              <>
                <span className="text-lg font-bold text-gray-900">${instructor.hourly_rate}</span>
                <span className="text-xs text-gray-400">/hr</span>
              </>
            )}
          </div>
          <span className="bg-[#064E3B] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all">
            Book Now
          </span>
        </div>
      </div>
    </Link>
  );
}
