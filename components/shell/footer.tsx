import { brand } from "@/lib/brand";
import { YorksteadMark } from "@/components/brand/yorkstead-logo";

export function Footer() {
  return (
    <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <YorksteadMark size={24} />
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase">
            {brand.name} &copy; {new Date().getFullYear()} — {brand.descriptor}
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <a
            href="https://yorkstead.com"
            className="text-muted-foreground hover:text-foreground transition underline-offset-4 hover:underline"
          >
            yorkstead.com
          </a>
          <span className="text-border">•</span>
          <a
            href="https://yorkstead.com/demos"
            className="text-muted-foreground hover:text-foreground transition underline-offset-4 hover:underline"
          >
            Demo Walkthroughs
          </a>
        </div>
      </div>
    </footer>
  );
}
