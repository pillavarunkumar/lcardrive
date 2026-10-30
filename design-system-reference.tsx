/* ─────────────────────────────────────────────────────────
   LCarDrive Design System — Complete Theory & Code Reference
   Copy-paste these patterns into your other project.
   ───────────────────────────────────────────────────────── */

// ══════════════════════════════════════════════════════════
// 1. FONT LOADING (put in your root layout.tsx)
// ══════════════════════════════════════════════════════════
//
// import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
//
// const display = Plus_Jakarta_Sans({
//   subsets: ['latin'],
//   variable: '--font-display',
//   display: 'swap',
//   weight: ['400', '500', '600', '700', '800'],
// });
//
// const body = Inter({
//   subsets: ['latin'],
//   variable: '--font-body',
//   display: 'swap',
//   weight: ['400', '500', '600'],
// });
//
// <html className={`${display.variable} ${body.variable}`}>
//   <body className="bg-surface text-on-surface font-body antialiased">

// ══════════════════════════════════════════════════════════
// 2. TYPOGRAPHY SCALE (usage examples)
// ══════════════════════════════════════════════════════════
//
// Token             Size  Weight  Usage
// text-display-lg   48px   600    Hero titles (desktop)
// text-display-lg-mobile 32px 600  Hero titles (mobile)
// text-headline-lg  32px   700    Section headings
// text-headline-md  24px   600    Card titles, sub-sections
// text-headline-sm  20px   600    Smaller section titles
// text-body-lg      18px   400    Large body text
// text-body-md      16px   400    Default body text
// text-label-md     14px   600    Buttons, form labels
// text-label-sm     13px   500    Small labels, badges
//
// Usage: <h1 className="text-display-lg font-display">Title</h1>
//        <p className="text-body-md font-body">Body text</p>
//        <span className="text-label-md font-label-md">Button</span>

// ══════════════════════════════════════════════════════════
// 3. COLOR TOKENS (using role-based names)
// ══════════════════════════════════════════════════════════
//
// bg-primary            → #003527 (dark green)
// text-on-primary       → #ffffff
// bg-primary-container  → #064e3b
// text-primary-container → #80bea6
// bg-surface            → #f8f9ff
// text-on-surface       → #0b1c30
// border-outline        → #707974
// border-outline-variant → #bfc9c3
// text-on-surface-variant → #404944
// text-error            → #ba1a1a (red)
// text-warning          → #d97706 (amber)
// border-[#E5E7EB]      → common card border
// text-[#64748B]        → muted body text

// ══════════════════════════════════════════════════════════
// 4. CARD PATTERNS
// ══════════════════════════════════════════════════════════
//
// DEFAULT CARD:
// <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm p-5
//                 hover:shadow-md hover:border-[#064E3B]/30 transition-all duration-200">
//
// BENTO CARD:
// <div className="bento-card p-5">
//   ← hover lifts 2px, border shifts to #006a61
//
// GLASS CARD:
// <div className="glass-card p-5">
//   ← frosted glass with blur(12px)
//
// FEATURE CARD:
// <div className="feature-card">
//   ← p-8 bg-surface rounded-xl border-outline-variant hover:border-primary
//
// CARD DIVIDER:
// <div className="border-t border-[#E5E7EB] pt-3">
//
// BADGES:
// <span className="px-2 py-0.5 bg-gray-100 text-[#64748B] rounded text-[11px] font-medium">
// <span className="px-2 py-0.5 bg-[#064E3B]/5 text-[#064E3B] rounded text-[11px] font-medium">

// ══════════════════════════════════════════════════════════
// 5. TABLE PATTERN
// ══════════════════════════════════════════════════════════
//
// <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm overflow-hidden">
//   <div className="overflow-x-auto">
//     <table className="w-full text-left border-collapse">
//       <thead>
//         <tr className="bg-gray-50 border-b border-[#E5E7EB]">
//           <th className="px-3 py-3.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
//       <tbody className="divide-y divide-[#E5E7EB]/50">
//         <tr className="hover:bg-gray-50 transition-colors">
//           <td className="px-3 py-3 text-xs text-gray-900">

// ══════════════════════════════════════════════════════════
// 6. SPARKLINE (inline SVG chart — no lib needed)
// ══════════════════════════════════════════════════════════
//
// function Sparkline({ data, color }: { data: number[]; color: string }) {
//   const width = 100;
//   const height = 40;
//   const max = Math.max(...data, 1);
//   const min = Math.min(...data);
//   const range = max - min || 1;
//   const points = data.map((v, i) => {
//     const x = (i / (data.length - 1)) * width;
//     const y = height - ((v - min) / range) * (height - 4) - 2;
//     return `${x},${y}`;
//   });
//   const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p}`).join(' ');
//   return (
//     <svg width={width} height={height} className="shrink-0">
//       <path d={pathD} fill="none" stroke={color} strokeWidth="2.5"
//             strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   );
// }
//
// Usage: <Sparkline data={[10, 25, 20, 35, 30, 45, 40, 55]} color="#064e3b" />

// ══════════════════════════════════════════════════════════
// 7. STAT CARD (admin dashboard pattern)
// ══════════════════════════════════════════════════════════
//
// <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm p-5
//                 hover:shadow-md transition-shadow duration-200">
//   <div className="flex justify-between items-start mb-5 md:mb-6">
//     <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide">
//       Label
//     </p>
//     <Sparkline ... />
//   </div>
//   <div className="flex items-end gap-2">
//     <p className="text-3xl md:text-4xl font-bold text-on-surface leading-none">
//       {value}
//     </p>
//   </div>
// </div>

// ══════════════════════════════════════════════════════════
// 8. STAR RATING (inline SVG)
// ══════════════════════════════════════════════════════════
//
// function StarRating({ rating, size }: { rating: number; size?: string }) {
//   return (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map((i) => (
//         <svg key={i} className={`${size} ${i <= Math.round(rating) ? 'text-yellow-500' : 'text-gray-200'}`}
//              viewBox="0 0 24 24" fill="currentColor">
//           <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
//         </svg>
//       ))}
//     </div>
//   );
// }

// ══════════════════════════════════════════════════════════
// 9. AMBIENT BACKGROUND ANIMATION (hero pages)
// ══════════════════════════════════════════════════════════
//
// <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#064E3B]/5 rounded-full
//                 blur-3xl animate-pulse" />
// <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#064E3B]/5 rounded-full
//                 blur-3xl animate-pulse [animation-delay:1s]" />

// ══════════════════════════════════════════════════════════
// 10. DESIGN PHILOSOPHY SUMMARY
// ══════════════════════════════════════════════════════════
//
// 1. Role-based colors, not literal ones (use "primary" not "green")
// 2. Every interactive element has a hover state (shadow + border shift)
// 3. Cards are the universal container — one pattern, everywhere
// 4. Tables use tiny uppercase headers + thin dividers for scanability
// 5. Animations are CSS-only, ≤0.5s, purposeful (fade-in, page-enter)
// 6. No charting library — inline SVG sparklines for trends
// 7. Dual typeface: expressive for headings, neutral for body
// 8. Consistent border-radius tiers: 8px / 12px / 16px / 20px
// 9. Padding/spacing in 8px increments, 24px as the standard gap
// 10. Container max 1440px, mobile margin 16px, desktop 40px
