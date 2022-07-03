import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';
import { join } from 'path';
import { URL } from 'url';


const {pathname: cwd} = new URL('.', import.meta.url);

export default defineConfig({
    root: join(cwd, 'docs'),
    server: {
        port: 8000,
    },
    plugins: [
        tsconfigPaths(),
    ],
});
