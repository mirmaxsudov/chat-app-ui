import { t } from '@lingui/core/macro';
import { z } from 'zod';

export const loginFormSchema = () =>
  z.object({
    phoneNumber: z.string().min(1, t`This field is required.`),
    password: z.string().min(1, t`This field is required.`)
  });

export type LoginFormSchema = z.infer<ReturnType<typeof loginFormSchema>>;
