"use client";

export default function LoginButton() {
  return (
    <a
      href="/api/auth/login"
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
    >
      Log In
    </a>
  );
}
