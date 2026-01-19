import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const loginAttemptRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const handleGoogleLogin = () => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
    const mode = 'login';
    localStorage.setItem('google_oauth_mode', mode);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&state=${encodeURIComponent(mode)}`;
    window.location.href = googleAuthUrl;
  };

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
    onMutate: () => {
      loginAttemptRef.current += 1;
      return { attemptId: loginAttemptRef.current };
    },
    onSuccess: ({ token, user }, _variables, context) => {
      if (context?.attemptId !== loginAttemptRef.current) return;
      queryClient.clear();
      setAuth(token, user);
      navigate(from, { replace: true });
    },
    onError: (err: Error, _variables, context) => {
      if (context?.attemptId !== loginAttemptRef.current) return;
      let message = err.message || '?????? ?????????. ?????? ?????????????????.';
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          message = '???/????? ???? ????.';
        } else if (err.response?.data && typeof err.response.data === 'object' && 'detail' in err.response.data) {
          message = String((err.response.data as { detail?: string }).detail);
        }
      }
      setError(message);
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
          <div className={styles.logoText}>비키니시티 정산소</div>
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

        <button type="button" className={styles.googleButton} onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          구글로 로그인
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
