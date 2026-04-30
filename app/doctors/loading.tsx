export default function Loading() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-8 pt-20 animate-pulse">
        <div className="h-3 w-24 bg-paper-deep mb-6" />
        <div className="h-16 w-3/4 bg-paper-deep mb-4" />
        <div className="h-16 w-1/2 bg-paper-deep mb-10" />
        <div className="h-4 w-2/3 bg-paper-deep mb-2" />
        <div className="h-4 w-1/2 bg-paper-deep" />
      </div>
    </div>
  );
}
