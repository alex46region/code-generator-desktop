{
  "name": "code-generator-terminal",
  "version": "1.0.0",
  "description": "Автономный генератор и менеджер кодов DataMatrix, QR и GS1-128",
  "main": "main.js",
  "author": "Logistic Solutions",
  "license": "MIT",
  "scripts": {
    "start": "electron .",
    "build": "electron-builder --win --x64"
  },
  "devDependencies": {
    "electron": "^31.0.0",
    "electron-builder": "^24.13.3"
  },
  "build": {
    "appId": "com.logistics.codegenerator",
    "productName": "Code Generator Terminal",
    "directories": {
      "output": "dist"
    },
    "files": [
      "main.js",
      "src/**/*"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Code Generator Terminal"
    }
  }
}
