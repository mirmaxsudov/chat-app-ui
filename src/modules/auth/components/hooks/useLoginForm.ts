import { useLingui } from '@lingui/react/macro';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import type { LoginFormSchema } from '@/modules/auth';

import { loginFormSchema, setAuthSession } from '@/modules/auth';
import { useAppForm } from '@/shared/ui/form/hooks';
import { toast } from '@/shared/ui/toast';
import { postLogin } from '@/utils/api';

export const useLoginForm = () => {
  const { t } = useLingui();
  const navigate = useNavigate();

  const postLoginMutation = useMutation({
    mutationFn: postLogin,
    meta: { withoutToastOnError: true },
    onSuccess: (data) => {
      setAuthSession(data);
      void navigate({ to: '/' });
    },
    onError: () =>
      toast.add({
        title: t`Login failed. Please check your credentials and try again.`,
        type: 'error'
      })
  });

  const form = useAppForm({
    validators: {
      onChange: loginFormSchema()
    },
    defaultValues: {
      password: '',
      phoneNumber: '+998'
    } as LoginFormSchema,
    onSubmit: ({ value }) => {
      postLoginMutation.mutate({
        data: value
      });
    }
  });

  return {
    form,
    mutation: postLoginMutation
  };
};
