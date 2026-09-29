import { useAppForm } from '@/shared/ui/form/hooks';
import { type LoginFormSchema, loginFormSchema, setAuthSession } from '@/modules/auth';
import { useMutation } from '@tanstack/react-query';
import { postLogin } from '@/utils/api';
import { useLingui } from '@lingui/react/macro';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

export const useLoginForm = () => {
  const { t } = useLingui();
  const navigate = useNavigate();

  const postLoginMutation = useMutation({
    mutationFn: postLogin,
    onSuccess: (data) => {
      setAuthSession(data);
      void navigate({ to: '/' });
    },
    onError: () => toast.error(t`Login failed. Please check your credentials and try again.`)
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
