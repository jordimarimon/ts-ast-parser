import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';


export default defineConfig({

    test: {
        include: [
            '**/test.ts',
        ],
        coverage: {
            reporter: ['cobertura'],
        },
    },

    plugins: [
        tsconfigPaths(),
    ],

});