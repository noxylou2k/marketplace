export function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white p-3 sm:p-5">
      <div className="mx-auto min-h-[calc(100vh-1.5rem)] max-w-6xl rounded-[1.75rem] border border-black/15 bg-[#eef0f3] p-4 sm:min-h-[calc(100vh-2.5rem)] sm:p-6">
        {children}
      </div>
    </div>
  )
}
