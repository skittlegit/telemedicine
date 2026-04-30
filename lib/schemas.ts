import { z } from "zod";
import { ROLES } from "@/lib/models/User";

export const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(200)
    .regex(/[a-zA-Z]/, "At least one letter")
    .regex(/[0-9]/, "At least one number"),
  role: z.enum(ROLES).default("patient"),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const BookingSchema = z.object({
  doctorId: z.string().min(1),
  startAt: z.iso.datetime(),
  reason: z.string().trim().min(1).max(2000),
});
export type BookingInput = z.infer<typeof BookingSchema>;

export const DrugSchema = z.object({
  name: z.string().trim().min(1).max(120),
  dose: z.string().trim().min(1).max(60),
  freq: z.string().trim().min(1).max(60),
  days: z.coerce.number().int().min(1).max(365),
  notes: z.string().trim().max(500).optional().default(""),
});

export const PrescriptionSchema = z.object({
  appointmentId: z.string().min(1),
  diagnosis: z.string().trim().min(1).max(2000),
  drugs: z.array(DrugSchema).min(1).max(20),
});
export type PrescriptionInput = z.infer<typeof PrescriptionSchema>;

export const PharmacyAddressSchema = z.object({
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(1).max(100),
  region: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().length(2).toUpperCase(),
});
export type PharmacyAddress = z.infer<typeof PharmacyAddressSchema>;
