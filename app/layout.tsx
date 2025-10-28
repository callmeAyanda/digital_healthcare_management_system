export const metadata = {
    title: "E-Health DHMS",
    description: "Digital Healthcare Management System",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-gray-50">{children}</body>
        </html>
    );
}


