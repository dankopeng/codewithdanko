import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'https://codewithdanko.tidepeng.workers.dev',
      },
    },
    include: ['tests/**/*.test.ts'],
  },
});
