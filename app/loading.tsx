export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Loading workspace...
        </span>
      </div>
    </div>
  );
}
