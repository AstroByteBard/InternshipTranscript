module.exports = {
  lintOnSave: false,
  runtimeCompiler: true,
  devServer: {
    disableHostCheck: true,
    proxy: {
      '^/api': {
        target: process.env.BACKEND_URL || 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        logLevel: 'warn'
      }
    }
  },
  configureWebpack: {
    //Necessary to run npm link https://webpack.js.org/configuration/resolve/#resolve-symlinks
    resolve: {
      symlinks: false
    }
  },
  transpileDependencies: [
    '@coreui/utils',
    'jspdf',
    'html2canvas',
    'fast-png',
    'fflate',
    'iobuffer',
    'image-size'
  ],
  // use this option for production linking
  // publicPath: process.env.NODE_ENV === 'production' ? '/vue/demo/3.0.0' : '/'
}
