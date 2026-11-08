import type { ReactNode } from "react";

interface AuthPageLayoutProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
}

export default function AuthPageLayout({
  title,
  description,
  icon,
  children,
}: AuthPageLayoutProps) {
  return (
    <section className="mx-auto w-full max-w-md py-8 sm:py-12">
      <div className="rounded-2xl border border-foreground/10 bg-surface p-5 shadow-sm sm:p-8">
        <header className={`mb-6 ${icon ? "text-center" : ""}`}>
          {icon && <div className="mb-3 flex justify-center">{icon}</div>}
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-foreground/60">{description}</p>
          )}
        </header>
        {children}
      </div>
    </section>
  );
}
