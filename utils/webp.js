import sharp from 'sharp'
import { glob } from 'glob'
import path from 'path'
import fs from 'fs'

const inputDir = 'src/img'
const outputDir = 'src/img/webp'

// Create folder if it doesn't exist
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true })
}

async function convertToWebp() {
	// Find all images, ignoring the already existing webp folder
	const images = await glob(`${inputDir}/**/*.{jpg,jpeg,png}`, {
		ignore: `${outputDir}/**`,
	})

	console.log(`Found ${images.length} images to convert...`)

	for (const file of images) {
		const fileName = path.basename(file, path.extname(file))
		const outputPath = path.join(outputDir, `${fileName}.webp`)

		await sharp(file)
			.webp({ quality: 80 })
			.toFile(outputPath)
			.catch(err => console.error(`Error processing ${file}:`, err))
	}

	console.log('✅ Conversion finished!')
}

convertToWebp()
