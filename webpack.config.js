const path = require('path');

module.exports = {
	mode: "development",
	entry: './src/index.ts',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.s[ac]ss$/i,
				use: [
					// Creates `style` nodes from JS strings
					"style-loader",
					// Translates CSS into CommonJS
					"css-loader",
					// Compiles Sass to CSS
					"sass-loader",
				],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true,
	},
	devServer: {
		contentBase: [
			path.join(__dirname, 'public'),
			path.join(__dirname, 'dist'),
		],
		index: 'index.html',
		compress: true,
		port: 3000,
		open: true,
		overlay: true,
		watchContentBase: true,
	}
};