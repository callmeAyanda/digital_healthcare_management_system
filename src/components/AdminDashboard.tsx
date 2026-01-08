import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const dashboardStats = useQuery(api.admin.getDashboardStats);
  const allPatients = useQuery(api.admin.getAllPatients);
  const allProviders = useQuery(api.admin.getAllProviders);
  const allAppointments = useQuery(api.admin.getAllAppointments);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Overview", icon: "📊" },
            { id: "patients", name: "Patients", icon: "👥" },
            { id: "providers", name: "Providers", icon: "👨‍⚕️" },
            { id: "appointments", name: "Appointments", icon: "📅" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <AdminOverview stats={dashboardStats} />}
      {activeTab === "patients" && <PatientsList patients={allPatients || []} />}
      {activeTab === "providers" && <ProvidersList providers={allProviders || []} />}
      {activeTab === "appointments" && <AppointmentsList appointments={allAppointments || []} />}
    </div>
  );
}

function AdminOverview({ stats }: any) {
  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Providers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProviders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📅</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">💊</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Prescriptions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPrescriptions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentAppointments.slice(0, 10).map((appointment: any) => (
            <div key={appointment._id} className="px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                  <p className="text-sm text-gray-600">with {appointment.providerName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {appointment.date} at {appointment.time}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{appointment.reason}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  appointment.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                  appointment.status === "completed" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          ))}
          {stats.recentAppointments.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No appointments found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PatientsList({ patients }: any) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((patient: any) =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">All Patients</h3>
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {filteredPatients.map((patient: any) => (
          <div key={patient._id} className="px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h4>
                <p className="text-sm text-gray-600">{patient.phone}</p>
                <p className="text-sm text-gray-500 mt-1">{patient.address}</p>
                <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                  <span>DOB: {patient.dateOfBirth}</span>
                  {patient.bloodType && <span>Blood Type: {patient.bloodType}</span>}
                </div>
                {patient.allergies && patient.allergies.length > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    Allergies: {patient.allergies.join(", ")}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Emergency Contact:</p>
                <p className="text-sm text-gray-700">{patient.emergencyContact}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredPatients.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No patients found
          </div>
        )}
      </div>
    </div>
  );
}

function ProvidersList({ providers }: any) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProviders = providers.filter((provider: any) =>
    `${provider.firstName} ${provider.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">All Healthcare Providers</h3>
          <input
            type="text"
            placeholder="Search providers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {filteredProviders.map((provider: any) => (
          <div key={provider._id} className="px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">
                  Dr. {provider.firstName} {provider.lastName}
                </h4>
                <p className="text-sm text-gray-600">{provider.specialization}</p>
                <p className="text-sm text-gray-500 mt-1">{provider.department}</p>
                <p className="text-sm text-gray-600 mt-1">{provider.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">License:</p>
                <p className="text-sm text-gray-700">{provider.licenseNumber}</p>
              </div>
            </div>
          </div>
        ))}
        {filteredProviders.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No providers found
          </div>
        )}
      </div>
    </div>
  );
}

function AppointmentsList({ appointments }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAppointments = appointments.filter((appointment: any) => {
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">All Appointments</h3>
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {filteredAppointments.map((appointment: any) => (
          <div key={appointment._id} className="px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                <p className="text-sm text-gray-600">with {appointment.providerName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {appointment.date} at {appointment.time}
                </p>
                <p className="text-sm text-gray-700 mt-1">{appointment.reason}</p>
                {appointment.notes && (
                  <p className="text-sm text-gray-600 mt-1">Notes: {appointment.notes}</p>
                )}
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                appointment.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                appointment.status === "completed" ? "bg-green-100 text-green-800" :
                "bg-red-100 text-red-800"
              }`}>
                {appointment.status}
              </span>
            </div>
          </div>
        ))}
        {filteredAppointments.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No appointments found
          </div>
        )}
      </div>
    </div>
  );
}
