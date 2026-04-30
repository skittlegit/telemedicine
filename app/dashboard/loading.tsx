export default function Loading() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 pt-12 animate-pulse">
        <div className="h-3 w-20 bg-paper-deep mb-4" />
        <div className="h-12 w-1/2 bg-paper-deep mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[color:var(--rule)] border border-[color:var(--rule)]">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-paper p-8 h-40" />
          ))}
        </div>
      </div>
    </div>
  );
}
