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
  // Doctor application fields (optional; required at the form layer when role=doctor)
  specialty: z.string().trim().min(2).max(80).optional(),
  licenseNumber: z.string().trim().min(2).max(60).optional(),
  licenseRegion: z.string().trim().min(2).max(80).optional(),
  // Pharmacist application fields
  pharmacyName: z.string().trim().min(2).max(120).optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const DoctorProfileUpdateSchema = z.object({
  specialty: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(2000).optional().default(""),
  licenseNumber: z.string().trim().min(2).max(60),
  licenseRegion: z.string().trim().min(2).max(80),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional().default(0),
  languages: z.string().trim().max(200).optional().default(""), // comma-separated on the wire
  consultationFeeCents: z.coerce.number().int().min(0).max(100_000).optional().default(5000),
});
export type DoctorProfileUpdateInput = z.infer<typeof DoctorProfileUpdateSchema>;

export const PharmacyProfileUpdateSchema = z.object({
  pharmacyName: z.string().trim().min(2).max(120),
  licenseNumber: z.string().trim().min(2).max(60),
  licenseRegion: z.string().trim().min(2).max(80),
  addressLine1: z.string().trim().max(200).optional().default(""),
  addressLine2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().max(100).optional().default(""),
  region: z.string().trim().max(100).optional().default(""),
  postalCode: z.string().trim().max(20).optional().default(""),
  country: z.string().trim().max(2).toUpperCase().optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
});
export type PharmacyProfileUpdateInput = z.infer<typeof PharmacyProfileUpdateSchema>;

export const PatientProfileUpdateSchema = z.object({
  dob: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  sex: z.enum(["male", "female", "other", "unspecified"]).default("unspecified"),
  phone: z.string().trim().max(40).optional().default(""),
  addressLine1: z.string().trim().max(200).optional().default(""),
  addressLine2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().max(100).optional().default(""),
  region: z.string().trim().max(100).optional().default(""),
  postalCode: z.string().trim().max(20).optional().default(""),
  country: z
    .string()
    .trim()
    .max(2)
    .toUpperCase()
    .optional()
    .default(""),
  allergies: z.string().trim().max(2000).optional().default(""),
  conditions: z.string().trim().max(2000).optional().default(""),
  medications: z.string().trim().max(2000).optional().default(""),
  insurance: z.string().trim().max(500).optional().default(""),
  emergencyContact: z.string().trim().max(500).optional().default(""),
});
export type PatientProfileUpdateInput = z.infer<typeof PatientProfileUpdateSchema>;

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

export const PharmacyOrderCreateSchema = z.object({
  prescriptionId: z.string().regex(/^[0-9a-f]{24}$/i, "Invalid prescription."),
  pharmacyId: z.string().regex(/^[0-9a-f]{24}$/i, "Please choose a pharmacy."),
  address: PharmacyAddressSchema,
});
export type PharmacyOrderCreateInput = z.infer<typeof PharmacyOrderCreateSchema>;
