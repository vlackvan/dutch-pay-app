import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi, usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import styles from './AuthPage.module.css';

const loginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);

  const from = location.state?.from?.pathname || '/settlements';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const tokenResponse = await authApi.login(data);
      localStorage.setItem('access_token', tokenResponse.access_token);
      const user = await usersApi.getMe();
      return { token: tokenResponse.access_token, user };
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
      navigate(from, { replace: true });
    },
    onError: (err: Error) => {
      setError(err.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>💸</div>
          <div className={styles.logoText}>Dutch Pay</div>
        </div>

        <h1 className={styles.title}>로그인</h1>

        {error && <div className={`${styles.alert} ${styles.alertError}`}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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

          <button type="submit" className={styles.submitButton} disabled={loginMutation.isPending}>
            {loginMutation.isPending ? '로그인 중...' : '로그인'}
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
          계정이 없으신가요?{' '}
          <Link to="/signup" className={styles.footerLink}>
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
