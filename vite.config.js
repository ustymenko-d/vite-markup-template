import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'
import path from 'path'
import { defineConfig } from 'vite'
import glob from 'fast-glob'
import { fileURLToPath } from 'url'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { createHtmlPlugin } from 'vite-plugin-html'
import { readFileSync, existsSync } from 'fs'

const htmlIncludePlugin = () => ({
	name: 'html-include',
	transformIndexHtml: {
		order: 'pre',
		handler(html) {
			const xmlIncludeRegex = /<include\s+src=["']([^"']+)["']([^>]*?)\s*\/>/g

			html = html.replace(xmlIncludeRegex, (match, componentPath, attributes) => {
				try {
					let normalizedPath = componentPath.replace(/^components\//, '').replace(/\.html$/, '')
					const componentFullPath = path.resolve(__dirname, `src/components/${normalizedPath}.html`)

					if (!existsSync(componentFullPath)) {
						console.warn(`Component not found: ${componentPath}`)
						return ''
					}

					let componentContent = readFileSync(componentFullPath, 'utf-8')

					if (attributes.trim()) {
						const attrRegex = /(\w+)=["']([^"']+)["']/g
						let attrMatch
						while ((attrMatch = attrRegex.exec(attributes)) !== null) {
							const key = attrMatch[1]
							const value = attrMatch[2]
							const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
							componentContent = componentContent.replace(regex, value)
						}
					}

					return componentContent
				} catch (error) {
					console.warn(`Error including component ${componentPath}:`, error.message)
					return ''
				}
			})

			return html
		},
	},
})

export default defineConfig({
	// Set the project root directory (where index.html is located)
	root: 'src',
	// Base public path when served in production
	base: './',

	plugins: [
		htmlIncludePlugin(),

		createHtmlPlugin({
			minify: false,
		}),

		ViteImageOptimizer({
			svg: {
				plugins: [
					'removeDoctype',
					'removeXMLProcInst',
					'minifyStyles',
					'sortAttrs',
					'sortDefsChildren',
				],
			},
			png: { quality: 70 },
			jpeg: { quality: 70 },
			jpg: { quality: 70 },
		}),

		{
			...imagemin(['./src/img/**/*.{jpg,png,jpeg}'], {
				destination: './src/img/webp/',
				plugins: [imageminWebp({ quality: 70 })],
			}),
			apply: 'serve',
		},
	],

	build: {
		// Output directory relative to the project root
		outDir: '../dist',
		emptyOutDir: true,
		rollupOptions: {
			input: Object.fromEntries(
				glob
					.sync(['./src/*.html'])
					.map(file => [
						path.basename(file, '.html'),
						fileURLToPath(new URL(file, import.meta.url)),
					]),
			),
		},
	},
})
