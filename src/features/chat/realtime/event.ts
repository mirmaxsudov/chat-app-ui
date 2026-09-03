import { z } from 'zod';

const messageEventSchema = z.object({
  type: z.literal('MESSAGE_CREATED'),
  chatId: z.uuid(),
  chatType: z.enum(['DIRECT', 'SAVED', 'GROUP', 'CHANNEL']),
  message: z.object({
    id: z.uuid(),
    seq: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    senderId: z.uuid(),
    text: z.string().max(4096),
    createdAt: z.iso.datetime({ local: true }),
    mine: z.boolean()
  })
});

export type RealtimeMessageEvent = z.infer<typeof messageEventSchema>;

export const parseMessageEvent = (body: string): RealtimeMessageEvent | null => {
  // Bound parsing work and ignore unknown/malformed frames without breaking the connection.
  if (body.length > 65_536) return null;
  try {
    const result = messageEventSchema.safeParse(JSON.parse(body));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};
