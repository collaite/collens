import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import Icons from 'unplugin-icons/vite'

import VitePluginRestart from 'vite-plugin-restart';


export default defineConfig({
	plugins: [
		enhancedImages(),

		VitePluginRestart({ restart: ['./content/**'] }),

		sveltekit(),
		Icons({
			compiler: 'svelte',
			autoInstall: true,
		}),
	],
	build: {
		outDir: 'build' // ensure the output directory is 'build'
	}
	// optimizeDeps: {
	// 	disabled: true,
	// },
});
