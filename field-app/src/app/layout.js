// src/app/layout.js
export const metadata = {
  title: "Field — Intelligence",
  description: "Sports, news, and markets — all in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#0C0C0E" }}>
        {children}
      </body>
    </html>
  );
}
