export default function Footer({ hasEnvVars }: { hasEnvVars: string | undefined }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = hasEnvVars; // Keep parameter for future use
  return (
    <footer className="w-full flex items-center justify-center border-t text-center text-xs gap-8 py-4 bg-background/80 backdrop-blur-sm relative z-10">
        <p>
        Copyright © 2025 Muhammad Affan. All rights reserved.
        </p>
    </footer>
  );
}