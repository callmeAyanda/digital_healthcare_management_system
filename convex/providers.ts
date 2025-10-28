import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create provider profile
export const createProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    specialization: v.string(),
    licenseNumber: v.string(),
    phone: v.string(),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("providers", {
      userId,
      ...args,
    });
  },
});

// Get provider profile
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("providers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

// Get all providers (for appointment booking)
export const getAllProviders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("providers").collect();
  },
});

// Get provider appointments
export const getAppointments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const provider = await ctx.db
      .query("providers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!provider) return [];

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_provider", (q) => q.eq("providerId", provider._id))
      .collect();

    // Get patient details for each appointment
    const appointmentsWithPatients = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await ctx.db.get(appointment.patientId);
        return {
          ...appointment,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
          patientPhone: patient?.phone || "",
        };
      })
    );

    return appointmentsWithPatients.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
});

// Create prescription
export const createPrescription = mutation({
  args: {
    patientId: v.id("patients"),
    medications: v.array(v.object({
      name: v.string(),
      dosage: v.string(),
      frequency: v.string(),
      duration: v.string(),
    })),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const provider = await ctx.db
      .query("providers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!provider) throw new Error("Provider profile not found");

    return await ctx.db.insert("prescriptions", {
      ...args,
      providerId: provider._id,
      status: "active",
    });
  },
});

// Add medical record
export const addMedicalRecord = mutation({
  args: {
    patientId: v.id("patients"),
    type: v.union(v.literal("diagnosis"), v.literal("lab_result"), v.literal("treatment")),
    title: v.string(),
    description: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const provider = await ctx.db
      .query("providers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!provider) throw new Error("Provider profile not found");

    return await ctx.db.insert("medicalRecords", {
      ...args,
      providerId: provider._id,
    });
  },
});

// Update appointment status
export const updateAppointmentStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(v.literal("scheduled"), v.literal("completed"), v.literal("cancelled")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const provider = await ctx.db
      .query("providers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!provider) throw new Error("Provider profile not found");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment || appointment.providerId !== provider._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.appointmentId, {
      status: args.status,
      notes: args.notes,
    });
  },
});
