import QueryProvider from "@/providers/query-provider";
import AuthProvider from "@/providers/auth-provider";
import "./globals.css";

export const metadata = {
  title: "Super Shop Management",
  description: "Super Shop Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}