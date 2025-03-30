import { z, ZodType } from "zod";
import type { LoginFormData } from "./types";

export const LoginFormDataSchema = z.object({
    email: z.string().email('Must be an email'),
    password: z.string().min(8, 'Minimum length is 8 characters'),
}) satisfies ZodType<LoginFormData>;