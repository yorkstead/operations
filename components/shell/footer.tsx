import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-mono text-[10px] tracking-[0.16em] uppercase">
          {brand.name} &copy; {new Date().getFullYear()} — {brand.descriptor}
        </p>
      </div>
    </footer>
  );
}
