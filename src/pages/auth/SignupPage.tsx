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
    password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

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
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💸</div>
          <div className={styles.logoText}>Dutch Pay</div>
        </div>

        <h1 className={styles.title}>회원가입</h1>

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

          <button type="submit" className={styles.submitButton} disabled={signupMutation.isPending}>
            {signupMutation.isPending ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>또는</span>
          <div className={styles.dividerLine} />
        </div>

        <button type="button" className={styles.kakaoButton}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 0C4.029 0 0 3.13 0 7c0 2.38 1.558 4.49 3.93 5.73-.122.46-.787 2.96-.815 3.16 0 0-.017.14.073.2.09.05.196.02.196.02.26-.04 3.013-1.98 3.49-2.32.37.05.75.08 1.126.08 4.971 0 9-3.13 9-7S13.971 0 9 0"
              fill="#191919"
            />
          </svg>
          카카오로 시작하기
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
