"use client";

/** Chyba v samotném layoutu – musí vykreslit i <html> a <body>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="cs">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#f5f5f7", color: "#1d1d1f", margin: 0 }}>
        <main
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Něco se pokazilo</p>
          <p style={{ color: "#6e6e73", marginTop: 8 }}>Zkus to prosím znovu.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "14px 28px",
              borderRadius: 999,
              border: 0,
              background: "#1d1d1f",
              color: "#fff",
              fontSize: 17,
              fontWeight: 600,
            }}
          >
            Zkusit znovu
          </button>
          {error.digest && <p style={{ marginTop: 24, fontSize: 12, color: "#aeaeb2" }}>Kód chyby: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
