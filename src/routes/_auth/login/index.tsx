import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Phone } from 'lucide-react';

import { currentUserQueryOptions } from '@/entities/user';
import { clearAuthSession, login, saveAuthSession, type LoginInput } from '@/features/auth';
import { getApiErrorBody, getApiErrorMessage, isValidationErrors } from '@/shared/api/errors';
import { Button } from '@/shared/ui/button';
import { Field, FieldError, FieldLabel } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';

type LoginFieldErrors = Partial<Record<keyof LoginInput, string>>;

const LoginPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [formError, setFormError] = useState<string>();

  const loginMutation = useMutation({
    mutationFn: async (input: LoginInput) => {
      const loginData = await login(input);
      saveAuthSession({
        accessToken: loginData.accessToken,
        expiresAt: loginData.expiresAt
      });

      try {
        return await queryClient.fetchQuery({
          ...currentUserQueryOptions(),
          staleTime: 0
        });
      } catch (error) {
        clearAuthSession();
        queryClient.removeQueries({ queryKey: currentUserQueryOptions().queryKey });
        throw error;
      }
    },
    meta: { withoutToastOnError: true },
    onSuccess: async () => {
      await navigate({ to: '/', replace: true });
    },
    onError: (error) => {
      const body = getApiErrorBody(error);

      if (isValidationErrors(body)) {
        setFieldErrors({
          phoneNumber: body.phoneNumber,
          password: body.password
        });
        return;
      }

      setFormError(getApiErrorMessage(error, 'Unable to sign in. Please try again.'));
    }
  });

  const validate = (): LoginFieldErrors => {
    const errors: LoginFieldErrors = {};
    if (!phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    else if (phoneNumber.trim().length > 32) errors.phoneNumber = 'Phone number is too long';
    if (!password.trim()) errors.password = 'Password is required';
    else if (password.length > 128) errors.password = 'Password is too long';
    return errors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(undefined);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    loginMutation.mutate({ phoneNumber: phoneNumber.trim(), password });
  };

  return (
    <div className='animate-in fade-in slide-in-from-bottom-3 duration-700'>
      <div className='mb-10'>
        <p className='mb-3 text-xs font-semibold tracking-[0.17em] text-[#2c7662] uppercase'>
          Welcome back
        </p>
        <h2 className='font-serif text-5xl leading-none tracking-[-0.045em] text-[#173f35] sm:text-6xl'>
          Sign in to Relay.
        </h2>
        <p className='mt-5 max-w-sm text-sm leading-6 text-[#66736e]'>
          Use the phone number associated with your workspace account.
        </p>
      </div>

      <form className='space-y-6' noValidate onSubmit={handleSubmit}>
        <Field data-invalid={Boolean(fieldErrors.phoneNumber)}>
          <FieldLabel htmlFor='phoneNumber' className='text-sm font-semibold text-[#26342f]'>
            Phone number
          </FieldLabel>
          <div className='relative'>
            <Phone className='pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#7a8881]' />
            <Input
              id='phoneNumber'
              name='phoneNumber'
              type='tel'
              autoComplete='tel'
              inputMode='tel'
              placeholder='+998 90 123 45 67'
              value={phoneNumber}
              aria-invalid={Boolean(fieldErrors.phoneNumber)}
              aria-describedby={fieldErrors.phoneNumber ? 'phoneNumber-error' : undefined}
              className='h-13 rounded-xl border-[#c7d0ca] bg-white/65 pr-4 pl-11 text-base shadow-none placeholder:text-[#9ba69f] focus-visible:border-[#2c7662] focus-visible:ring-[#2c7662]/20 md:text-sm'
              onChange={(event) => {
                setPhoneNumber(event.target.value);
                setFieldErrors((current) => ({ ...current, phoneNumber: undefined }));
              }}
            />
          </div>
          <FieldError id='phoneNumber-error'>{fieldErrors.phoneNumber}</FieldError>
        </Field>

        <Field data-invalid={Boolean(fieldErrors.password)}>
          <FieldLabel htmlFor='password' className='text-sm font-semibold text-[#26342f]'>
            Password
          </FieldLabel>
          <div className='relative'>
            <LockKeyhole className='pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#7a8881]' />
            <Input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder='Enter your password'
              value={password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              className='h-13 rounded-xl border-[#c7d0ca] bg-white/65 pr-12 pl-11 text-base shadow-none placeholder:text-[#9ba69f] focus-visible:border-[#2c7662] focus-visible:ring-[#2c7662]/20 md:text-sm'
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((current) => ({ ...current, password: undefined }));
              }}
            />
            <button
              type='button'
              className='absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-[#6d7a74] transition-colors hover:bg-[#e8ece6] hover:text-[#173f35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c7662]'
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
            </button>
          </div>
          <FieldError id='password-error'>{fieldErrors.password}</FieldError>
        </Field>

        {formError && (
          <div
            role='alert'
            className='rounded-xl border border-[#c85d4b]/25 bg-[#c85d4b]/8 px-4 py-3 text-sm leading-5 text-[#963f32]'
          >
            {formError}
          </div>
        )}

        <Button
          type='submit'
          size='lg'
          disabled={loginMutation.isPending}
          className='h-13 w-full rounded-xl bg-[#173f35] text-sm font-semibold text-white shadow-[0_12px_25px_-14px_#173f35] hover:bg-[#235a4b]'
        >
          {loginMutation.isPending ? (
            <>
              <LoaderCircle className='animate-spin' data-icon='inline-start' />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className='mt-8 flex items-center gap-2 text-xs leading-5 text-[#77837d]'>
        <LockKeyhole className='size-3.5' /> Your credentials are sent over a secure connection.
      </p>
    </div>
  );
};

export const Route = createFileRoute('/_auth/login/')({
  component: LoginPage
});
