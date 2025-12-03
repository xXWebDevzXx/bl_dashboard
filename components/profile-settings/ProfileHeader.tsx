interface ProfileHeaderProps {
  title: string;
  subtitle: string;
}

export function ProfileHeader({ title, subtitle }: ProfileHeaderProps) {
  return (
    <div className="mb-8 animate-[fadeIn_0.6s_ease-out]">
      <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
      <p className="text-zinc-400 mt-1">{subtitle}</p>
    </div>
  );
}

