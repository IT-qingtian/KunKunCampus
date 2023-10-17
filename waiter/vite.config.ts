import {defineConfig} from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import uni from "@dcloudio/vite-plugin-uni";
import fs from 'fs'
import path from 'path';
import https from 'https';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        uni(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    server: {
        port: 80,
        // https: {
        //     // key: fs.readFileSync(path.join(__dirname, 'visa', 'key.pem')),
        //     key: fs.readFileSync(path.join(__dirname, 'visa', 'server.key')),
        //     // cert: fs.readFileSync(path.join(__dirname, 'visa', 'server.crt')),
        //     cert: fs.readFileSync(path.join(__dirname, 'visa', 'server.crt')),
        // }
    }
});