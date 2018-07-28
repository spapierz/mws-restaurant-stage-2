/*import ServiceWorkerWebpackPlugin from 'serviceworker-webpack-plugin';*/

const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: __dirname + "/src/js",
  mode: 'development',
  devtool: 'source-map',
  entry: {
  	'main': './main.js', 
  	'dbhelper': './dbhelper.js',
  	'restaurant': './restaurant_info.js', 
  },
  output: {
  	path: __dirname + "/site/js",
    filename: "[name].min.js"
  }, 
  module: {
    rules: [
    	{
	      test: /\.css$/,
	      use: [
	        { loader: "style-loader" },
	        { loader: "css-loader" }
	      ]
	    },
  		{
  			test: /\.js$/,
  			exclude: /node_modules/,
  			loader: 'babel-loader',
  			query: {
  			  presets: ['es2015']
  			}, 

  		}
    ]
  }, 
  /*plugins: [
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, './sw.js'),
      assets: './main.256334452761ef349e91.js'
    })
  ],*/
  watch: true
};