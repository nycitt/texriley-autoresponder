module.exports = {
    entry: "./main.js",
    output: {
        path: __dirname,
        filename: "dist/bundle.js"
    },
    module: {
        loaders: [
            { test: /\.hbs$/, loader: "handlebars-loader" }
        ]
    },
    node: {
        fs: "empty"
    }
};