import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  // .env, .env.development, .env.production 등에서 값을 읽어옵니다.
  // - 로컬 개발: VITE_API_PROXY_TARGET=http://localhost:4000
  // - 배포(AWS): VITE_API_BASE_URL=https://api.your-domain.com (프론트에서 직접 호출)
  const env = loadEnv(mode, process.cwd(), "");

  // 1) dev proxy 타겟(권장): VITE_API_PROXY_TARGET
  // 2) 프론트에서 직접 호출할 API 베이스: VITE_API_BASE_URL
  // 둘 다 없으면 로컬 백엔드(4000)를 기본값으로 사용
  const rawTarget = env.VITE_API_PROXY_TARGET || env.VITE_API_BASE_URL || "http://15.164.214.69";
  const apiTarget = rawTarget.replace(/\/$/, "");

  // 배포 환경에서는 보통 프론트가 백엔드를 직접 호출하므로 proxy를 끄고 싶을 수 있습니다.
  // 필요 시 .env.production 에서 VITE_DISABLE_PROXY=true 로 설정하세요.
  const disableProxy = env.VITE_DISABLE_PROXY === "true";

  return {
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
    },
    server: {
      // 로컬 개발에서만 /api 를 백엔드로 프록시
      // 배포에서는 보통 프론트가 백엔드를 직접 호출(VITE_API_BASE_URL)하므로 proxy 비활성화 권장
      proxy: disableProxy
        ? undefined
        : {
            "/api": {
              target: apiTarget,
              changeOrigin: true,
              secure: false,
            },
            "/uploads": {
              target: apiTarget,
              changeOrigin: true,
              secure: false,
            },
          },
    },
  };
});