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
          className={`material-symbols-outlined ${size} ${i <= Math.round(rating) ? 'text-[#facc15]' : 'text-outline-variant'}`}
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
      className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all"
    >
      <span
        className={`material-symbols-outlined text-[18px] ${saved ? 'text-primary' : 'text-on-surface-variant/60'}`}
        style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
      >
        bookmark
      </span>
    </button>
  );
}

export default function InstructorCard({ instructor, aiReason, variant = 'stacked', limitedSpots }: Props) {
  const fullName = `${instructor.first_name} ${instructor.last_name}`;
  const nameVerified = !!instructor.verified_name;
  const avatarUrl = getAvatarUrl(instructor);

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/instructors/${instructor.suburb.toLowerCase().replace(/\s+/g, '-')}/${instructor.slug}`}
        className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.08)] hover:shadow-[0px_12px_30px_rgba(6,78,59,0.15)] border border-outline-variant hover:border-primary transition-all duration-300 flex flex-col relative group"
      >
        <div className="relative bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex gap-4 p-5 pb-3">
            <div className="relative flex-shrink-0">
              <img
                src={avatarUrl}
                alt=""
                className="w-20 h-20 rounded-xl object-cover border-2 border-white shadow-md flex-shrink-0"
              />
              {limitedSpots && (
                <div className="absolute -top-1.5 -right-1.5 bg-tertiary-container text-on-tertiary-container px-1.5 py-0.5 rounded text-[8px] font-bold uppercase shadow-sm">
                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">{fullName}</h2>
                {nameVerified && (
                  <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={instructor.average_rating} size="text-[14px]" />
                <span className="font-bold text-on-surface text-sm">{instructor.average_rating.toFixed(1)}</span>
                <span className="text-outline text-xs">({instructor.review_count})</span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm mt-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                <span className="truncate">{instructor.suburb} &amp; Inner West</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <SaveButton instructorId={instructor.id} />
              {instructor.is_verified && !limitedSpots && (
                <div className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  <span className="material-symbols-outlined text-[12px] align-text-bottom" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-5 pt-2 pb-3">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {instructor.transmission && (
              <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-[11px] font-medium">
                {instructor.transmission === 'auto' ? 'Auto' : instructor.transmission === 'manual' ? 'Manual' : 'Auto & Manual'}
              </span>
            )}
            {instructor.specialises_anxiety && (
              <span className="px-2 py-0.5 bg-primary/5 text-primary rounded text-[11px] font-medium">Anxiety Friendly</span>
            )}
            {instructor.accepts_international && (
              <span className="px-2 py-0.5 bg-primary/5 text-primary rounded text-[11px] font-medium">Intl. Licence</span>
            )}
          </div>
          {aiReason && (
            <div className="bg-primary/5 border-l-[3px] border-primary rounded-r-lg p-2.5 mb-2">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="material-symbols-outlined text-primary text-[14px]">psychology</span>
                <span className="text-[11px] font-bold text-on-surface">Why this match?</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-snug">{aiReason}</p>
            </div>
          )}
        </div>
        <div className="mt-auto px-5 pb-4 pt-3 border-t border-outline-variant/50 flex justify-between items-center">
          <div>
            <span className="text-[11px] text-on-surface-variant block leading-none mb-0.5">Starting from</span>
            <span className="text-lg font-bold text-on-surface">
              ${instructor.hourly_rate}<span className="text-xs font-normal text-outline">/hr</span>
            </span>
          </div>
          <span className="bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
            View Profile
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/instructors/${instructor.suburb.toLowerCase().replace(/\s+/g, '-')}/${instructor.slug}`}
      className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.08)] hover:shadow-[0px_12px_30px_rgba(6,78,59,0.15)] hover:border-primary transition-all duration-300 group block"
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
        {instructor.is_verified && !limitedSpots && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Verified
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg font-display font-bold text-on-surface truncate">{fullName}</h3>
              {nameVerified && (
                <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              {instructor.suburb} • {instructor.service_radius_km}km
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={instructor.average_rating} size="text-[16px]" />
          <span className="text-sm font-bold text-on-surface">{instructor.average_rating.toFixed(1)}</span>
          <span className="text-xs text-outline">({instructor.review_count})</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {instructor.transmission && (
            <span className="text-[11px] font-medium bg-surface-container text-on-surface-variant px-2 py-0.5 rounded capitalize">
              {instructor.transmission === 'both' ? 'Auto & Manual' : instructor.transmission}
            </span>
          )}
          {instructor.specialises_anxiety && (
            <span className="text-[11px] font-medium bg-primary/5 text-primary px-2 py-0.5 rounded">Anxiety-friendly</span>
          )}
          {instructor.accepts_international && (
            <span className="text-[11px] font-medium bg-primary/5 text-primary px-2 py-0.5 rounded">Intl. Licence</span>
          )}
        </div>
        <p className="text-xs text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
          {instructor.bio || `${instructor.first_name} is a driving instructor serving the ${instructor.suburb} area.`}
        </p>
        {aiReason && (
          <div className="bg-primary/5 border-l-[3px] border-primary rounded-r-lg p-3 mb-4">
            <span className="flex items-center gap-1 text-xs font-bold text-on-surface mb-1">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              Why this match?
            </span>
            <p className="text-xs text-on-surface-variant leading-snug">{aiReason}</p>
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/50">
          <div>
            {instructor.hourly_rate && (
              <>
                <span className="text-lg font-bold text-on-surface">${instructor.hourly_rate}</span>
                <span className="text-xs text-outline">/hr</span>
              </>
            )}
          </div>
          <span className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
            Book Now
          </span>
        </div>
      </div>
    </Link>
  );
}
