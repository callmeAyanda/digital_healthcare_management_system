import { useState } from "react";

interface ProfileSetupProps {
  onUserTypeSelect: (type: "patient" | "provider" | "admin") => void;
}

export default function ProfileSetup({ onUserTypeSelect }: ProfileSetupProps) {
  return (
    <div className="flex items-center justify-center min-h-[500px] p-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to E-Health</h2>
          <p className="text-gray-600">Please select your role to continue</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => onUserTypeSelect("patient")}
            className="w-full p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Patient</h3>
                <p className="text-gray-600">Access your medical records, book appointments</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onUserTypeSelect("provider")}
            className="w-full p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Healthcare Provider</h3>
                <p className="text-gray-600">Manage patients, appointments, and prescriptions</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => onUserTypeSelect("admin")}
            className="w-full p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Administrator</h3>
                <p className="text-gray-600">System overview and management</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
