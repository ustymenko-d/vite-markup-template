module.exports = ({ env }) => ({
	plugins: [
		require('postcss-sort-media-queries')({
			sort: 'mobile-first',
		}),
		require('autoprefixer')()
	]
})