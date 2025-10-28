import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import PatientDashboard from "./components/PatientDashboard";
import ProviderDashboard from "./components/ProviderDashboard";
import AdminDashboard from "./components/AdminDashboard";
import ProfileSetup from "./components/ProfileSetup";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-blue-600">E-Health DHMS</h2>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const patientProfile = useQuery(api.patients.getProfile);
  const providerProfile = useQuery(api.providers.getProfile);
  const [userType, setUserType] = useState<"patient" | "provider" | "admin" | null>(null);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-[500px] p-8">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-blue-600 mb-4">Digital Healthcare Management</h1>
              <p className="text-xl text-gray-600">Secure, efficient healthcare for everyone</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {!patientProfile && !providerProfile && !userType && (
          <ProfileSetup onUserTypeSelect={setUserType} />
        )}
        
        {(patientProfile || userType === "patient") && (
          <PatientDashboard />
        )}
        
        {(providerProfile || userType === "provider") && (
          <ProviderDashboard />
        )}
        
        {userType === "admin" && (
          <AdminDashboard />
        )}
      </Authenticated>
    </div>
  );
}
