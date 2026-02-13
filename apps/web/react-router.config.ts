import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: true,
	// Disabled prerendering for production builds - was causing build failures
	// prerender: ['/*?'],
} satisfies Config;
