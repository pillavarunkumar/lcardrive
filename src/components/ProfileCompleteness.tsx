interface Props {
  score: number;
  variant?: 'default' | 'large';
}

export default function ProfileCompleteness({ score, variant = 'default' }: Props) {
  const color = score >= 80 ? 'bg-primary' : score >= 50 ? 'bg-tertiary-fixed-dim' : 'bg-error';

  return (
    <div className={`border border-outline-variant rounded-2xl card-shadow ${variant === 'large' ? 'p-6' : 'p-5'}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-on-surface">Profile Completeness</h3>
        <span className="text-sm font-bold text-on-surface">{score}%</span>
      </div>
      <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-outline mt-2">
        {score < 100
          ? 'A complete profile attracts 3x more students. Fill in the remaining fields to boost your visibility.'
          : 'Great job! Your profile is complete.'}
      </p>
    </div>
  );
}
