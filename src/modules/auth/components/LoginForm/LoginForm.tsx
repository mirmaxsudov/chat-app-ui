import { useLoginForm } from '@/modules/auth';
import { useLingui } from '@lingui/react/macro';
import { Button } from '@/shared/ui/button';
import { FieldGroup } from '@/shared/ui/field';
import { Spinner } from '@/shared/ui/spinner';

export const LoginForm = () => {
  const { form, mutation } = useLoginForm();
  const { t } = useLingui();

  return (
    <form.AppForm>
      <form
        noValidate
        onSubmit={(e) => {
          e.stopPropagation();
          e.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FieldGroup className='gap-5'>
          <form.AppField name='phoneNumber'>
            {(field) => (
              <field.PhoneInput
                isRequired
                label={t`Phone number`}
                placeholder='+998 90 123 45 67'
                className='md:text-md h-12 rounded-xl px-4'
              />
            )}
          </form.AppField>
          <form.AppField name='password'>
            {(field) => (
              <field.PasswordInput
                isRequired
                autoComplete='current-password'
                label={t`Password`}
                placeholder={t`Enter your password`}
                className='h-12 rounded-xl'
                inputClassName='md:text-md'
              />
            )}
          </form.AppField>
          <Button
            type='submit'
            size='lg'
            disabled={mutation.isPending}
            className='mt-1 h-12 w-full rounded-xl text-sm'
          >
            {mutation.isPending && <Spinner data-icon='inline-start' />}
            {mutation.isPending ? t`Signing in…` : t`Sign in`}
          </Button>
        </FieldGroup>
      </form>
    </form.AppForm>
  );
};
