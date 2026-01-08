import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Patient records
  patients: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    phone: v.string(),
    address: v.string(),
    emergencyContact: v.string(),
    bloodType: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalHistory: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),

  // Healthcare providers (doctors, nurses)
  providers: defineTable({
    userId: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    specialization: v.string(),
    licenseNumber: v.string(),
    phone: v.string(),
    department: v.string(),
  }).index("by_user", ["userId"]),

  // Appointments
  appointments: defineTable({
    patientId: v.id("patients"),
    providerId: v.id("providers"),
    date: v.string(),
    time: v.string(),
    status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    reason: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_patient", ["patientId"])
    .index("by_provider", ["providerId"])
    .index("by_date", ["date"]),

  // Prescriptions
  prescriptions: defineTable({
    patientId: v.id("patients"),
    providerId: v.id("providers"),
    appointmentId: v.optional(v.id("appointments")),
    medications: v.array(v.object({
      name: v.string(),
      dosage: v.string(),
      frequency: v.string(),
      duration: v.string(),
    })),
    instructions: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
  })
    .index("by_patient", ["patientId"])
    .index("by_provider", ["providerId"]),

  // Medical records
  medicalRecords: defineTable({
    patientId: v.id("patients"),
    providerId: v.id("providers"),
    appointmentId: v.optional(v.id("appointments")),
    type: v.union(v.literal("diagnosis"), v.literal("lab_result"), v.literal("treatment")),
    title: v.string(),
    description: v.string(),
    date: v.string(),
  })
    .index("by_patient", ["patientId"])
    .index("by_type", ["type"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
