const path = require('path');

const webpack = require('webpack');
const _ = require('lodash');

const BabiliPlugin = require('babili-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');

function convertObj(obj) {
	let rtn = {};

	for (let key in obj) {
		rtn[key] = JSON.stringify(obj[key]);
	}

	return rtn;
}

module.exports = async (...args) => {
	let env_vars = convertObj({
		'process.env': process.env.NODE_ENV
	});

	return {
		mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
		entry: {
			app: path.join(__dirname, './view/entry/App.jsx'),
			login: path.join(__dirname, './view/entry/Login.jsx')
		},
		output: {
			path: path.join(__dirname, './assets/scripts'),
			publicPath: '/assets/scripts/',
			filename: '[name].js',
			chunkFilename: '[name].js'
		},
		module: {
			rules: [
				{
					test: /\.jsx$/,
					loader: 'babel-loader',
					query: {
						presets: ['react'],
						plugins: ['syntax-dynamic-import']
					}
				}
			]
		},
		resolve: {
			extensions: ['.js', '.jsx', '.json']
		},
		devtool: 'source-map',
		optimization: {
			splitChunks: {
				cacheGroups: {
					vendor: {
						name: 'vendor',
						test: /[\\/]node_modules[\\/]/,
						chunks: 'all'
					},
					common: {
						name: 'common',
						chunks: 'initial',
						minChunks: 2
					}
				}
			},
			runtimeChunk: true
		},
		plugins: [
			new webpack.DefinePlugin(env_vars),
			// new webpack.SourceMapDevToolPlugin({
			// 	filename: '[file].map',
			// 	exclude: ['vendor', 'init'],
			// 	publicPath: '/assets/scripts/'
			// }),
			process.env.NODE_ENV === 'production' ? new BabiliPlugin() : () => {
			},
			new ManifestPlugin({
				publicPath: '/assets/scripts/',
				filename: 'manifest.json',
				filter: asset => {
					return path.extname(asset.path) !== '.map';
				}
			})
		]
	};
};
