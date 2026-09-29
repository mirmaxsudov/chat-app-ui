import { t } from '@lingui/core/macro';

import { toast } from '@/shared/ui/toast';

export const copyToClipboard = (content: string) => {
  if (navigator.clipboard) void navigator.clipboard.writeText(content);
  toast.add({ title: t`Copied to clipboard`, type: 'success' });
};
