"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} style={{ marginRight: 8 }}>
      Print
    </button>
  );
}
