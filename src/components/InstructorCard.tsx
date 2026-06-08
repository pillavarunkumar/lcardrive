import Link from 'next/link';
import type { Instructor } from '@/types';

interface Props {
  instructor: Instructor;
  aiReason?: string;
  variant?: 'stacked' | 'horizontal';
  limitedSpots?: boolean;
}

export default function InstructorCard({ instructor, aiReason, variant = 'stacked', limitedSpots }: Props) {
  const initial = `${instructor.first_name} ${instructor.last_name[0]}.`;
  const initials = `${instructor.first_name[0]}${instructor.last_name[0]}`;

  if (variant === 'horizontal') {
    return (
      <Link
        href={`/instructors/${instructor.suburb.toLowerCase().replace(/\s+/g, '-')}/${instructor.slug}`}
        className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_4px_20px_rgba(15,23,42,0.08)] hover:shadow-[0px_10px_25px_rgba(15,23,42,0.12)] border border-transparent hover:border-secondary transition-all duration-300 flex flex-col relative group cursor-pointer"
      >
        <div className="absolute top-4 right-4 flex gap-2">
          {limitedSpots && (
            <div className="bg-tertiary-container text-on-tertiary-container px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span> Limited Spots
            </div>
          )}
          {instructor.is_verified && !limitedSpots && (
            <div className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verified
            </div>
          )}
        </div>
        <div className="flex gap-4 mb-4">
          {instructor.profile_photo_url ? (
            <img
              src={instructor.profile_photo_url}
              alt=""
              className="w-20 h-20 rounded-full object-cover border-2 border-surface-container-high shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0 border-2 border-surface-container-high">
              <span className="text-lg font-display font-bold text-on-surface-variant">{initials}</span>
            </div>
          )}
          <div className="flex flex-col justify-center">
            <h2 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors">{initial}</h2>
            <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm mt-0.5">
              <span className="material-symbols-outlined text-[16px] text-[#facc15]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <span className="font-bold text-on-surface">{instructor.average_rating.toFixed(1)}</span>
              <span>({instructor.review_count} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm mt-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              <span>{instructor.suburb} &amp; Inner West • {instructor.service_radius_km}km</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {instructor.transmission && (
            <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-md font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">settings</span>
              {instructor.transmission === 'auto' ? 'Auto' : instructor.transmission === 'manual' ? 'Manual' : 'Auto & Manual'}
            </span>
          )}
          {instructor.specialises_anxiety && (
            <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-md font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">psychology</span> Anxiety Friendly
            </span>
          )}
          {instructor.accepts_international && (
            <span className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-md font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">language</span> Multi-lingual
            </span>
          )}
        </div>
        {aiReason && (
          <div className="ai-gradient-bg border-l-4 border-secondary rounded-r-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-secondary text-[16px]">psychology</span>
              <span className="font-label-sm text-label-sm font-bold text-on-surface">Why this match?</span>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{aiReason}</p>
          </div>
        )}
        <div className="mt-auto pt-4 border-t border-surface-container flex justify-between items-end">
          <div>
            <span className="text-on-surface-variant font-label-sm text-label-sm block">Starting from</span>
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              ${instructor.hourly_rate}<span className="text-label-sm font-normal text-on-surface-variant">/hr</span>
            </span>
          </div>
          <button className="bg-surface-container border border-outline-variant text-on-surface px-4 py-2 rounded-lg font-label-md text-label-md group-hover:bg-secondary group-hover:text-on-secondary group-hover:border-secondary transition-all">
            View Profile
          </button>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/instructors/${instructor.suburb.toLowerCase().replace(/\s+/g, '-')}/${instructor.slug}`}
      className="bg-white border border-outline-variant rounded-xl overflow-hidden card-shadow transition-all group block"
    >
      <div className="relative h-48 overflow-hidden">
        {instructor.profile_photo_url ? (
          <img
            src={instructor.profile_photo_url}
            alt={instructor.first_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-surface-container flex items-center justify-center">
            <span className="text-4xl font-display font-bold text-on-surface-variant">{initials}</span>
          </div>
        )}
        {limitedSpots && (
          <div className="absolute top-4 right-4 bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            Limited Spots
          </div>
        )}
        {instructor.is_verified && !limitedSpots && (
          <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Verified
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-display font-semibold text-on-surface">{initial}</h3>
          <div className="flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed px-2 py-1 rounded-md">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-sm font-bold">{instructor.average_rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex gap-2 mb-4 flex-wrap">
          {instructor.transmission && (
            <span className="text-xs font-bold bg-surface-container-low border border-outline-variant px-2 py-1 rounded capitalize">
              {instructor.transmission === 'both' ? 'Auto & Manual' : instructor.transmission}
            </span>
          )}
          {instructor.specialises_anxiety && (
            <span className="text-xs font-bold bg-secondary-container text-on-secondary-container px-2 py-1 rounded">Anxiety-friendly</span>
          )}
          {instructor.accepts_international && (
            <span className="text-xs font-bold bg-secondary-container text-on-secondary-container px-2 py-1 rounded">Intl. Licence</span>
          )}
        </div>
        <p className="text-on-surface-variant text-sm font-body mb-6 line-clamp-2">
          {instructor.bio || `${instructor.first_name} is a driving instructor serving the ${instructor.suburb} area.`}
        </p>
        {aiReason && (
          <div className="ai-gradient-bg border-l-4 border-secondary rounded-r-lg p-3 mb-4 text-sm text-on-surface">
            <span className="flex items-center gap-1 font-semibold mb-1">
              <span className="material-symbols-outlined text-sm">psychology</span>
              Why this match?
            </span>
            {aiReason}
          </div>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant">
          <div className="text-on-surface">
            {instructor.hourly_rate && (
              <>
                <span className="text-lg font-bold">${instructor.hourly_rate}</span>
                <span className="text-xs text-outline">/hr</span>
              </>
            )}
          </div>
          <span className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-bold group-hover:brightness-110 transition-all">
            Book Now
          </span>
        </div>
      </div>
    </Link>
  );
}
