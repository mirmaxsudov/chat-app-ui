import { z } from 'zod';

const attachmentSchema = z.object({
  sortOrder: z.number().int().nonnegative(),
  attachment: z.object({
    name: z.string(),
    contentType: z.string(),
    sizeBytes: z.number().int().nonnegative(),
    publicURL: z.string(),
    thumbnailURL: z.string().nullable().default(null),
    type: z.enum(['IMAGE', 'VIDEO', 'EXCEL', 'AUDIO', 'PDF', 'PPT', 'OTHERS'])
  })
});

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
    mine: z.boolean(),
    attachments: z.array(attachmentSchema).optional()
  })
});

const presenceEventSchema = z.object({
  type: z.literal('PRESENCE_CHANGED'),
  userId: z.uuid(),
  status: z.enum(['ONLINE', 'OFFLINE']),
  lastSeenAt: z.iso.datetime({ offset: true }).nullable(),
  changedAt: z.iso.datetime({ offset: true })
});

type ParsedMessageEvent = z.infer<typeof messageEventSchema>;
export type RealtimeMessageEvent = Omit<ParsedMessageEvent, 'message'> & {
  message: Omit<ParsedMessageEvent['message'], 'attachments'> & {
    attachments: NonNullable<ParsedMessageEvent['message']['attachments']>;
  };
};
export type RealtimePresenceEvent = z.infer<typeof presenceEventSchema>;

export const parseMessageEvent = (body: string): RealtimeMessageEvent | null => {
  // Bound parsing work and ignore unknown/malformed frames without breaking the connection.
  if (body.length > 65_536) return null;
  try {
    const result = messageEventSchema.safeParse(JSON.parse(body));
    return result.success ? (result.data as RealtimeMessageEvent) : null;
  } catch {
    return null;
  }
};

export const parsePresenceEvent = (body: string): RealtimePresenceEvent | null => {
  if (body.length > 65_536) return null;
  try {
    const result = presenceEventSchema.safeParse(JSON.parse(body));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};
