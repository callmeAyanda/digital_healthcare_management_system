import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Book appointment (for patients)
export const bookAppointment = mutation({
  args: {
    providerId: v.id("providers"),
    date: v.string(),
    time: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const patient = await ctx.db
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!patient) throw new Error("Patient profile not found");

    // Check if provider exists
    const provider = await ctx.db.get(args.providerId);
    if (!provider) throw new Error("Provider not found");

    // Check for conflicting appointments
    const existingAppointment = await ctx.db
      .query("appointments")
      .withIndex("by_provider", (q) => q.eq("providerId", args.providerId))
      .filter((q) => q.and(
        q.eq(q.field("date"), args.date),
        q.eq(q.field("time"), args.time),
        q.neq(q.field("status"), "cancelled")
      ))
      .first();

    if (existingAppointment) {
      throw new Error("This time slot is already booked");
    }

    return await ctx.db.insert("appointments", {
      patientId: patient._id,
      providerId: args.providerId,
      date: args.date,
      time: args.time,
      reason: args.reason,
      status: "scheduled",
    });
  },
});

// Cancel appointment
export const cancelAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    // Check if user is the patient who booked the appointment
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!patient || appointment.patientId !== patient._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.appointmentId, {
      status: "cancelled",
    });
  },
});

// Get available time slots for a provider on a specific date
export const getAvailableSlots = query({
  args: {
    providerId: v.id("providers"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    // Get all booked appointments for this provider on this date
    const bookedAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_provider", (q) => q.eq("providerId", args.providerId))
      .filter((q) => q.and(
        q.eq(q.field("date"), args.date),
        q.neq(q.field("status"), "cancelled")
      ))
      .collect();

    const bookedTimes = bookedAppointments.map(apt => apt.time);

    // Define available time slots (9 AM to 5 PM, hourly)
    const allSlots = [
      "09:00", "10:00", "11:00", "12:00", 
      "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    return allSlots.filter(slot => !bookedTimes.includes(slot));
  },
});
