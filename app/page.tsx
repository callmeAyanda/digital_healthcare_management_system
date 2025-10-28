export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
                <h2 className="text-xl font-semibold text-blue-600">E-Health DHMS</h2>
            </header>
            <main className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center">
                    <h1 className="text-4xl font-bold text-blue-600 mb-4">Digital Healthcare Management</h1>
                    <p className="text-lg text-gray-600">Next.js migration in progress</p>
                </div>
            </main>
        </div>
    );
}


