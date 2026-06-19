import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">QR Contact Cards</h1>
        <p className="text-gray-500 text-base leading-relaxed mb-8">
          Scan a badge QR to connect with people at the conference. Your info stays private
          until you choose to share it.
        </p>
        <Link href="/admin" className="btn-secondary inline-block">
          Admin →
        </Link>
      </div>
    </main>
  );
}
