interface ProfileAvatarProps {
  name?: string | null;
  picture?: string | null;
}

export function ProfileAvatar({ name }: ProfileAvatarProps) {
  return (
    <div className="relative group mb-6">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-normal to-cyan-normal rounded-full opacity-70 blur group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-[#161B22] bg-gradient-to-br from-emerald-normal to-cyan-normal flex items-center justify-center">
        <span className="text-3xl font-bold text-white">
          {name?.charAt(0)?.toUpperCase() || "U"}
        </span>
      </div>
    </div>
  );
}

