import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const providerProfile = useQuery(api.providers.getProfile);
  const appointments = useQuery(api.providers.getAppointments);

  if (!providerProfile) {
    return <ProviderProfileForm />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dr. {providerProfile.firstName} {providerProfile.lastName}
        </h1>
        <p className="text-gray-600">{providerProfile.specialization} • {providerProfile.department}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", name: "Overview", icon: "📊" },
            { id: "appointments", name: "Appointments", icon: "📅" },
            { id: "prescriptions", name: "Prescriptions", icon: "💊" },
            { id: "records", name: "Medical Records", icon: "📋" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
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
      {activeTab === "overview" && <ProviderOverview appointments={appointments || []} />}
      {activeTab === "appointments" && <ProviderAppointments appointments={appointments || []} />}
      {activeTab === "prescriptions" && <CreatePrescription />}
      {activeTab === "records" && <CreateMedicalRecord />}
    </div>
  );
}

function ProviderProfileForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    licenseNumber: "",
    phone: "",
    department: "",
  });

  const createProfile = useMutation(api.providers.createProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProfile(formData);
      toast.success("Provider profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Your Provider Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>
        <input
          type="text"
          placeholder="Specialization"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          placeholder="License Number"
          value={formData.licenseNumber}
          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <input
          type="text"
          placeholder="Department"
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          Create Profile
        </button>
      </form>
    </div>
  );
}

function ProviderOverview({ appointments }: any) {
  const todayAppointments = appointments.filter((apt: any) => 
    apt.date === new Date().toISOString().split('T')[0]
  );

  const upcomingAppointments = appointments.filter((apt: any) => 
    apt.status === "scheduled" && new Date(apt.date) >= new Date()
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Today's Appointments */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h3>
        <div className="text-3xl font-bold text-green-600 mb-2">{todayAppointments.length}</div>
        {todayAppointments.slice(0, 3).map((apt: any) => (
          <div key={apt._id} className="border-l-4 border-green-500 pl-3 mb-2">
            <p className="font-medium">{apt.patientName}</p>
            <p className="text-sm text-gray-600">{apt.time}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">{upcomingAppointments.length}</div>
        {upcomingAppointments.slice(0, 3).map((apt: any) => (
          <div key={apt._id} className="border-l-4 border-blue-500 pl-3 mb-2">
            <p className="font-medium">{apt.patientName}</p>
            <p className="text-sm text-gray-600">{apt.date} at {apt.time}</p>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Appointments</span>
            <span className="font-semibold">{appointments.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Completed</span>
            <span className="font-semibold text-green-600">
              {appointments.filter((apt: any) => apt.status === "completed").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cancelled</span>
            <span className="font-semibold text-red-600">
              {appointments.filter((apt: any) => apt.status === "cancelled").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderAppointments({ appointments }: any) {
  const updateAppointmentStatus = useMutation(api.providers.updateAppointmentStatus);

  const handleStatusUpdate = async (appointmentId: Id<"appointments">, status: "scheduled" | "completed" | "cancelled", notes?: string) => {
    try {
      await updateAppointmentStatus({ appointmentId, status, notes });
      toast.success("Appointment updated successfully");
    } catch (error) {
      toast.error("Failed to update appointment");
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
                <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                <p className="text-sm text-gray-600">{appointment.patientPhone}</p>
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
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, "completed")}
                      className="text-green-600 hover:text-green-800 text-sm px-2 py-1 border border-green-300 rounded"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(appointment._id, "cancelled")}
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-300 rounded"
                    >
                      Cancel
                    </button>
                  </div>
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

function CreatePrescription() {
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [medications, setMedications] = useState([
    { name: "", dosage: "", frequency: "", duration: "" }
  ]);
  const [instructions, setInstructions] = useState("");

  const createPrescription = useMutation(api.providers.createPrescription);
  const allPatients = useQuery(api.admin.getAllPatients);

  const filteredPatients = allPatients?.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(patientSearch.toLowerCase())
  ) || [];

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    try {
      await createPrescription({
        patientId: selectedPatient as Id<"patients">,
        medications: medications.filter(med => med.name),
        instructions: instructions || undefined,
      });
      toast.success("Prescription created successfully!");
      setSelectedPatient("");
      setMedications([{ name: "", dosage: "", frequency: "", duration: "" }]);
      setInstructions("");
      setPatientSearch("");
    } catch (error) {
      toast.error("Failed to create prescription");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Prescription</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
          <input
            type="text"
            placeholder="Search patients..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {patientSearch && (
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredPatients.map((patient: any) => (
                <button
                  key={patient._id}
                  type="button"
                  onClick={() => {
                    setSelectedPatient(patient._id);
                    setPatientSearch(`${patient.firstName} ${patient.lastName}`);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  {patient.firstName} {patient.lastName} - {patient.phone}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Medications */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Medications</label>
            <button
              type="button"
              onClick={addMedication}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              + Add Medication
            </button>
          </div>
          {medications.map((medication, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
              <input
                type="text"
                placeholder="Medication name"
                value={medication.name}
                onChange={(e) => updateMedication(index, "name", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Dosage"
                value={medication.dosage}
                onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                placeholder="Frequency"
                value={medication.frequency}
                onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <div className="flex">
                <input
                  type="text"
                  placeholder="Duration"
                  value={medication.duration}
                  onChange={(e) => updateMedication(index, "duration", e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-r hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optional)</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={3}
            placeholder="Additional instructions for the patient..."
          />
        </div>

        <button
          type="submit"
          disabled={!selectedPatient || !medications.some(med => med.name)}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Create Prescription
        </button>
      </form>
    </div>
  );
}

function CreateMedicalRecord() {
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [recordType, setRecordType] = useState<"diagnosis" | "lab_result" | "treatment">("diagnosis");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const addMedicalRecord = useMutation(api.providers.addMedicalRecord);
  const allPatients = useQuery(api.admin.getAllPatients);

  const filteredPatients = allPatients?.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(patientSearch.toLowerCase())
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    try {
      await addMedicalRecord({
        patientId: selectedPatient as Id<"patients">,
        type: recordType,
        title,
        description,
        date,
      });
      toast.success("Medical record added successfully!");
      setSelectedPatient("");
      setTitle("");
      setDescription("");
      setPatientSearch("");
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      toast.error("Failed to add medical record");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Add Medical Record</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
          <input
            type="text"
            placeholder="Search patients..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {patientSearch && (
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredPatients.map((patient: any) => (
                <button
                  key={patient._id}
                  type="button"
                  onClick={() => {
                    setSelectedPatient(patient._id);
                    setPatientSearch(`${patient.firstName} ${patient.lastName}`);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  {patient.firstName} {patient.lastName} - {patient.phone}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="diagnosis">Diagnosis</option>
              <option value="lab_result">Lab Result</option>
              <option value="treatment">Treatment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          disabled={!selectedPatient || !title || !description}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Medical Record
        </button>
      </form>
    </div>
  );
}
