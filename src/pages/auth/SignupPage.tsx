import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import styles from './AuthPage.module.css';

const signupSchema = z
  .object({
    name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
    email: z.string().email('유효한 이메일을 입력하세요'),
    password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'), // 확인하신 부분
    confirmPassword: z.string(),
    paymentMethod: z.enum(['kakaopay', 'toss', 'bank'], {
      invalid_type_error: '희망 입금 방식을 선택해주세요', // required_error 대신 사용
    }),
    paymentAccount: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })
  .refine((data) => (data.paymentMethod === 'bank' ? !!data.paymentAccount : true), {
    message: '계좌이체 선택 시 계좌번호를 입력해주세요',
    path: ['paymentAccount'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      paymentMethod: 'kakaopay',
    },
  });
  const watchPaymentMethod = watch('paymentMethod');

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    },
    onError: (err: Error) => {
      setError(err.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
    },
  });

const onSubmit = (data: SignupFormData) => {
    setError(null);
    signupMutation.mutate({
      name: data.name,
      email: data.email,
      password: data.password,
      payment_method: data.paymentMethod,
      payment_account: data.paymentAccount || '',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/login-frame.png" alt="" className={styles.logoImage} />
        </div>

        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}
        {success && (
          <div className={`${styles.alert} ${styles.alertSuccess}`}>
            회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">
              이름
            </label>
            <input
              id="name"
              type="text"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              placeholder="홍길동"
              {...register('name')}
            />
            {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              이메일
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              placeholder="email@example.com"
              {...register('email')}
            />
            {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="confirmPassword">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <span className={styles.errorText}>{errors.confirmPassword.message}</span>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>희망 입금 방식</label>
            <select {...register('paymentMethod')} className={`${styles.input} ${errors.paymentMethod ? styles.inputError : ''}`}>
              <option value="kakaopay">카카오페이</option>
              <option value="toss">토스</option>
              <option value="bank">계좌이체 (직접 입력)</option>
            </select>
            {errors.paymentMethod && <span className={styles.errorText}>{errors.paymentMethod.message}</span>}
          </div>

          {/* 계좌이체 선택 시에만 계좌번호 입력란 표시 */}
          {watchPaymentMethod === 'bank' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="paymentAccount">계좌번호 (은행명 포함)</label>
              <input
                id="paymentAccount"
                type="text"
                className={`${styles.input} ${errors.paymentAccount ? styles.inputError : ''}`}
                placeholder="예: 신한은행 110-123-456789"
                {...register('paymentAccount')}
              />
              {errors.paymentAccount && <span className={styles.errorText}>{errors.paymentAccount.message}</span>}
            </div>
          )}

          {/* 버튼 색상 강제 지정 (CSS 변수 누락 대비) */}
          <button 
            type="submit" 
            className={styles.submitButton} 
            style={{ backgroundColor: '#4f46e5', marginTop: '1rem' }}
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? '가입 중...' : '회원가입 완료'}
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>또는</span>
          <div className={styles.dividerLine} />
        </div>

        <button
          type="button"
          className={styles.googleButton}
          onClick={() => {
            const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
            const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
            const mode = 'signup';
            localStorage.setItem('google_oauth_mode', mode);
            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&state=${encodeURIComponent(mode)}`;
            window.location.href = googleAuthUrl;
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          구글로 회원가입
        </button>

        <p className={styles.footer}>
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className={styles.footerLink}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
