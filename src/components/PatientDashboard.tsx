import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const patientProfile = useQuery(api.patients.getProfile);
  const appointments = useQuery(api.patients.getAppointments);
  const prescriptions = useQuery(api.patients.getPrescriptions);
  const medicalRecords = useQuery(api.patients.getMedicalRecords);
  const providers = useQuery(api.providers.getAllProviders);

  if (!patientProfile) {
    return <PatientProfileForm />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {patientProfile.firstName} {patientProfile.lastName}
        </h1>
        <p className="text-gray-600">Manage your healthcare information</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Overview", icon: "📊" },
            { id: "appointments", name: "Appointments", icon: "📅" },
            { id: "prescriptions", name: "Prescriptions", icon: "💊" },
            { id: "records", name: "Medical Records", icon: "📋" },
            { id: "book", name: "Book Appointment", icon: "➕" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
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
      {activeTab === "overview" && (
        <PatientOverview 
          appointments={appointments || []}
          prescriptions={prescriptions || []}
          records={medicalRecords || []}
        />
      )}
      {activeTab === "appointments" && <AppointmentsList appointments={appointments || []} />}
      {activeTab === "prescriptions" && <PrescriptionsList prescriptions={prescriptions || []} />}
      {activeTab === "records" && <MedicalRecordsList records={medicalRecords || []} />}
      {activeTab === "book" && <BookAppointment providers={providers || []} />}
    </div>
  );
}

function PatientProfileForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    emergencyContact: "",
    bloodType: "",
    allergies: "",
  });

  const createProfile = useMutation(api.patients.createProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProfile({
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(",").map(a => a.trim()) : [],
      });
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Patient Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <input
          type="date"
          placeholder="Date of Birth"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <textarea
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          required
        />
        <input
          type="text"
          placeholder="Emergency Contact"
          value={formData.emergencyContact}
          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          placeholder="Blood Type (optional)"
          value={formData.bloodType}
          onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <input
          type="text"
          placeholder="Allergies (comma-separated, optional)"
          value={formData.allergies}
          onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Profile
        </button>
      </form>
    </div>
  );
}

function PatientOverview({ appointments, prescriptions, records }: any) {
  const upcomingAppointments = appointments.filter((apt: any) => 
    apt.status === "scheduled" && new Date(apt.date) >= new Date()
  ).slice(0, 3);

  const activePrescriptions = prescriptions.filter((rx: any) => rx.status === "active").slice(0, 3);
  const recentRecords = records.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Upcoming Appointments */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
        {upcomingAppointments.length > 0 ? (
          <div className="space-y-3">
            {upcomingAppointments.map((apt: any) => (
              <div key={apt._id} className="border-l-4 border-blue-500 pl-3">
                <p className="font-medium">{apt.providerName}</p>
                <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
                <p className="text-sm text-gray-500">{apt.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming appointments</p>
        )}
      </div>

      {/* Active Prescriptions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Prescriptions</h3>
        {activePrescriptions.length > 0 ? (
          <div className="space-y-3">
            {activePrescriptions.map((rx: any) => (
              <div key={rx._id} className="border-l-4 border-green-500 pl-3">
                <p className="font-medium">{rx.medications[0]?.name}</p>
                <p className="text-sm text-gray-600">By {rx.providerName}</p>
                <p className="text-sm text-gray-500">{rx.medications.length} medication(s)</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No active prescriptions</p>
        )}
      </div>

      {/* Recent Records */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Records</h3>
        {recentRecords.length > 0 ? (
          <div className="space-y-3">
            {recentRecords.map((record: any) => (
              <div key={record._id} className="border-l-4 border-purple-500 pl-3">
                <p className="font-medium">{record.title}</p>
                <p className="text-sm text-gray-600">{record.providerName}</p>
                <p className="text-sm text-gray-500">{record.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No medical records</p>
        )}
      </div>
    </div>
  );
}

function AppointmentsList({ appointments }: any) {
  const cancelAppointment = useMutation(api.appointments.cancelAppointment);

  const handleCancel = async (appointmentId: Id<"appointments">) => {
    try {
      await cancelAppointment({ appointmentId });
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Your Appointments</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {appointments.map((appointment: any) => (
          <div key={appointment._id} className="px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{appointment.providerName}</h4>
                <p className="text-sm text-gray-600">{appointment.providerSpecialization}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {appointment.date} at {appointment.time}
                </p>
                <p className="text-sm text-gray-700 mt-1">{appointment.reason}</p>
                {appointment.notes && (
                  <p className="text-sm text-gray-600 mt-1">Notes: {appointment.notes}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  appointment.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                  appointment.status === "completed" ? "bg-green-100 text-green-800" :
                  "bg-red-100 text-red-800"
                }`}>
                  {appointment.status}
                </span>
                {appointment.status === "scheduled" && (
                  <button
                    onClick={() => handleCancel(appointment._id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No appointments found
          </div>
        )}
      </div>
    </div>
  );
}

function PrescriptionsList({ prescriptions }: any) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Your Prescriptions</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {prescriptions.map((prescription: any) => (
          <div key={prescription._id} className="px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">Prescribed by {prescription.providerName}</h4>
                <div className="mt-2 space-y-1">
                  {prescription.medications.map((med: any, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{med.name}</span> - {med.dosage}, {med.frequency} for {med.duration}
                    </div>
                  ))}
                </div>
                {prescription.instructions && (
                  <p className="text-sm text-gray-600 mt-2">Instructions: {prescription.instructions}</p>
                )}
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                prescription.status === "active" ? "bg-green-100 text-green-800" :
                prescription.status === "completed" ? "bg-gray-100 text-gray-800" :
                "bg-red-100 text-red-800"
              }`}>
                {prescription.status}
              </span>
            </div>
          </div>
        ))}
        {prescriptions.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No prescriptions found
          </div>
        )}
      </div>
    </div>
  );
}

function MedicalRecordsList({ records }: any) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Medical Records</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {records.map((record: any) => (
          <div key={record._id} className="px-6 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{record.title}</h4>
                <p className="text-sm text-gray-600">By {record.providerName}</p>
                <p className="text-sm text-gray-700 mt-1">{record.description}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  record.type === "diagnosis" ? "bg-red-100 text-red-800" :
                  record.type === "lab_result" ? "bg-blue-100 text-blue-800" :
                  "bg-green-100 text-green-800"
                }`}>
                  {record.type.replace("_", " ")}
                </span>
                <p className="text-sm text-gray-500 mt-1">{record.date}</p>
              </div>
            </div>
          </div>
        ))}
        {records.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No medical records found
          </div>
        )}
      </div>
    </div>
  );
}

function BookAppointment({ providers }: any) {
  const [selectedProvider, setSelectedProvider] = useState<Id<"providers"> | "">("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const bookAppointment = useMutation(api.appointments.bookAppointment);
  const availableSlots = useQuery(api.appointments.getAvailableSlots, 
    selectedProvider && date ? { providerId: selectedProvider as Id<"providers">, date } : "skip"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookAppointment({
        providerId: selectedProvider as Id<"providers">,
        date,
        time,
        reason,
      });
      toast.success("Appointment booked successfully!");
      setSelectedProvider("");
      setDate("");
      setTime("");
      setReason("");
    } catch (error: any) {
      toast.error(error.message || "Failed to book appointment");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Book New Appointment</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value as Id<"providers"> | "")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Choose a doctor...</option>
            {providers.map((provider: any) => (
              <option key={provider._id} value={provider._id}>
                Dr. {provider.firstName} {provider.lastName} - {provider.specialization}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {selectedProvider && date && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Times</label>
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select time...</option>
              {availableSlots?.map((slot: string) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            required
          />
        </div>

        <button
          type="submit"
          disabled={!selectedProvider || !date || !time || !reason}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Book Appointment
        </button>
      </form>
    </div>
  );
}
