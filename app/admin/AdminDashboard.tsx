"use client";

import { generateBatch, logout, resetCard, deleteCard } from "./actions";

type Card = {
  id: string;
  name: string | null;
  lastName: string | null;
  company: string | null;
  claimed: boolean;
  createdAt: Date;
  qrDataUrl: string;
  photoDataUrl: string | null;
};

export default function AdminDashboard({ cards }: { cards: Card[] }) {
  const claimed = cards.filter((c) => c.claimed).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">QR Cards — Admin</h1>
          <p className="text-sm text-gray-500">
            {cards.length} total · {claimed} claimed · {cards.length - claimed} unclaimed
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href="/admin/print"
            target="_blank"
            className="btn-secondary text-sm"
          >
            Print unclaimed QRs
          </a>
          <form action={logout}>
            <button className="btn-secondary text-sm">Sign out</button>
          </form>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Generate batch */}
        <div className="card max-w-sm">
          <h2 className="font-semibold text-gray-800 mb-3">Generate QR codes</h2>
          <form action={generateBatch} className="flex gap-2">
            <input
              type="number"
              name="count"
              defaultValue={10}
              min={1}
              max={500}
              className="input w-24"
            />
            <button type="submit" className="btn-primary">
              Generate
            </button>
          </form>
        </div>

        {/* Cards table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">QR</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Company</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cards.map((card) => (
                <tr key={card.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.qrDataUrl} alt="QR" className="w-14 h-14" />
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    <div className="flex items-center gap-2">
                      {card.photoDataUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={card.photoDataUrl}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
                      )}
                      {card.name ? (
                        <span className="font-medium text-gray-900">
                          {card.name} {card.lastName}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Unclaimed</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{card.company ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        card.claimed
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {card.claimed ? "Claimed" : "Open"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {card.claimed && (
                        <form method="get" action={`/c/${card.id}`} target="_blank">
                          <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                            View
                          </button>
                        </form>
                      )}
                      <form method="get" action={`/admin/print?id=${card.id}`}>
                        <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                          Print
                        </button>
                      </form>
                      {card.claimed && (
                        <form action={resetCard.bind(null, card.id)}>
                          <button className="text-xs text-amber-600 hover:text-amber-800 font-medium">
                            Reset
                          </button>
                        </form>
                      )}
                      <form
                        action={deleteCard.bind(null, card.id)}
                        onSubmit={(e) => {
                          if (!confirm("Delete this card?")) e.preventDefault();
                        }}
                      >
                        <button className="text-xs text-red-500 hover:text-red-700 font-medium">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No cards yet — generate some above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
