export default function Loading() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-[480px] px-6 pt-24 animate-pulse">
        <div className="h-3 w-20 bg-paper-deep mb-4" />
        <div className="h-10 w-full bg-paper-deep mb-3" />
        <div className="h-10 w-5/6 bg-paper-deep mb-8" />
        <div className="h-11 w-full bg-paper-deep mb-3" />
        <div className="h-11 w-full bg-paper-deep mb-3" />
        <div className="h-11 w-full bg-paper-deep" />
      </div>
    </div>
  );
}
