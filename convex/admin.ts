import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get dashboard statistics
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get counts
    const totalPatients = await ctx.db.query("patients").collect();
    const totalProviders = await ctx.db.query("providers").collect();
    const totalAppointments = await ctx.db.query("appointments").collect();
    const totalPrescriptions = await ctx.db.query("prescriptions").collect();

    // Get today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", today))
      .collect();

    // Get recent appointments
    const recentAppointments = await ctx.db
      .query("appointments")
      .order("desc")
      .take(10);

    const appointmentsWithDetails = await Promise.all(
      recentAppointments.map(async (appointment) => {
        const patient = await ctx.db.get(appointment.patientId);
        const provider = await ctx.db.get(appointment.providerId);
        return {
          ...appointment,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
          providerName: provider ? `Dr. ${provider.firstName} ${provider.lastName}` : "Unknown",
        };
      })
    );

    return {
      totalPatients: totalPatients.length,
      totalProviders: totalProviders.length,
      totalAppointments: totalAppointments.length,
      totalPrescriptions: totalPrescriptions.length,
      todayAppointments: todayAppointments.length,
      recentAppointments: appointmentsWithDetails,
    };
  },
});

// Get all patients (for admin)
export const getAllPatients = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.query("patients").collect();
  },
});

// Get all providers (for admin)
export const getAllProviders = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.query("providers").collect();
  },
});

// Get all appointments (for admin)
export const getAllAppointments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const appointments = await ctx.db.query("appointments").collect();

    const appointmentsWithDetails = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await ctx.db.get(appointment.patientId);
        const provider = await ctx.db.get(appointment.providerId);
        return {
          ...appointment,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : "Unknown",
          providerName: provider ? `Dr. ${provider.firstName} ${provider.lastName}` : "Unknown",
        };
      })
    );

    return appointmentsWithDetails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
});
