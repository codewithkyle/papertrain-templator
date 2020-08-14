const path = require("path");
const cwd = process.cwd();

module.exports = {
    entry: {
        "page-builder": path.join(__dirname, "page-builder", "index.tsx"),
    },
    mode: process.env.NODE_ENV === "production" ? "production" : "development",
    module: {
        rules: [
            {
                test: /\.tsx$/,
                exclude: /(node_modules)/,
                loader: "ts-loader",
                options: {
                    configFile: path.join(__dirname, "tsconfig-preact.json"),
                },
            },
            {
                test: /\.s[ac]ss$/i,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader", "postcss-loader"],
            },
        ],
    },
    resolve: { extensions: ["*", ".js", ".jsx", ".ts", ".tsx"] },
    output: {
        filename: "[name].js",
        path: path.join(cwd, "modules", "papertrainmodule", "src", "assets", "js"),
    },
    watch: process.env.NODE_ENV !== "production",
};
