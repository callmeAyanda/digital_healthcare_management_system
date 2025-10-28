import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create patient profile
export const createProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    dateOfBirth: v.string(),
    phone: v.string(),
    address: v.string(),
    emergencyContact: v.string(),
    bloodType: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("patients", {
      userId,
      ...args,
      medicalHistory: [],
    });
  },
});

// Get patient profile
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

// Update patient profile
export const updateProfile = mutation({
  args: {
    patientId: v.id("patients"),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.string(),
    address: v.string(),
    emergencyContact: v.string(),
    bloodType: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { patientId, ...updates } = args;
    
    // Verify patient belongs to user
    const patient = await ctx.db.get(patientId);
    if (!patient || patient.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(patientId, updates);
  },
});

// Get patient appointments
export const getAppointments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const patient = await ctx.db
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!patient) return [];

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
      .collect();

    // Get provider details for each appointment
    const appointmentsWithProviders = await Promise.all(
      appointments.map(async (appointment) => {
        const provider = await ctx.db.get(appointment.providerId);
        return {
          ...appointment,
          providerName: provider ? `Dr. ${provider.firstName} ${provider.lastName}` : "Unknown",
          providerSpecialization: provider?.specialization || "",
        };
      })
    );

    return appointmentsWithProviders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
});

// Get patient prescriptions
export const getPrescriptions = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const patient = await ctx.db
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!patient) return [];

    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
      .collect();

    // Get provider details for each prescription
    const prescriptionsWithProviders = await Promise.all(
      prescriptions.map(async (prescription) => {
        const provider = await ctx.db.get(prescription.providerId);
        return {
          ...prescription,
          providerName: provider ? `Dr. ${provider.firstName} ${provider.lastName}` : "Unknown",
        };
      })
    );

    return prescriptionsWithProviders.sort((a, b) => b._creationTime - a._creationTime);
  },
});

// Get medical records
export const getMedicalRecords = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const patient = await ctx.db
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!patient) return [];

    const records = await ctx.db
      .query("medicalRecords")
      .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
      .collect();

    // Get provider details for each record
    const recordsWithProviders = await Promise.all(
      records.map(async (record) => {
        const provider = await ctx.db.get(record.providerId);
        return {
          ...record,
          providerName: provider ? `Dr. ${provider.firstName} ${provider.lastName}` : "Unknown",
        };
      })
    );

    return recordsWithProviders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
});
