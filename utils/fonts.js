import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import ttf2woff2 from 'ttf2woff2'

const fontsDir = 'src/fonts'
const scssFile = 'src/scss/_fonts.scss'

async function convertFonts() {
	const fonts = await glob(`${fontsDir}/**/*.ttf`)

	if (!fonts.length) {
		console.log('No .ttf fonts found')
		return
	}

	console.log(`Found ${fonts.length} fonts to convert...`)

	let scssOutput = ''

	for (const file of fonts) {
		const fileName = path.basename(file, '.ttf')
		const dirName = path.dirname(file)

		const woff2Path = path.join(dirName, `${fileName}.woff2`)

		if (!fs.existsSync(woff2Path)) {
			const input = fs.readFileSync(file)
			const output = ttf2woff2(input)
			fs.writeFileSync(woff2Path, output)
			console.log(`Converted: ${fileName}.woff2`)
		}

		let weight = 400
		if (/thin/i.test(fileName)) weight = 100
		else if (/extralight/i.test(fileName)) weight = 200
		else if (/light/i.test(fileName)) weight = 300
		else if (/medium/i.test(fileName)) weight = 500
		else if (/semibold/i.test(fileName)) weight = 600
		else if (/bold/i.test(fileName)) weight = 700
		else if (/extrabold/i.test(fileName)) weight = 800
		else if (/black/i.test(fileName)) weight = 900

		const style = /italic/i.test(fileName) ? 'italic' : 'normal'

		const fontFamily = fileName
			.replace(/[-_](thin|extralight|light|medium|semibold|bold|extrabold|black)/gi, '')
			.replace(/[-_]italic/gi, '')

		scssOutput += `
@font-face {
	font-family: '${fontFamily}';
	src: url('../fonts/${fileName}.woff2') format('woff2');
	font-weight: ${weight};
	font-style: ${style};
	font-display: swap;
}
`
	}

	fs.writeFileSync(scssFile, scssOutput.trim())

	console.log('✅ Fonts converted and _fonts.scss generated')
}

convertFonts()
