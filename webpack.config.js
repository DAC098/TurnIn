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
			loaders: [
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
		plugins: [
			new webpack.DefinePlugin(env_vars),
			new webpack.optimize.CommonsChunkPlugin({
				name: 'vendor',
				minChunks: (module, count) => {
					let context = module.context;
					return context && context.indexOf('node_modules') >= 0;
				}
			}),
			new webpack.optimize.CommonsChunkPlugin({
				name: 'common',
				minChunks: 2
			}),
			new webpack.optimize.CommonsChunkPlugin({
				name: 'init',
				minChunks: Infinity
			}),
			new webpack.SourceMapDevToolPlugin({
				filename: '[file].map',
				exclude: ['vendor', 'init'],
				publicPath: '/assets/scripts/'
			}),
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
