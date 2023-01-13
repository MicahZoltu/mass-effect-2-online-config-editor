# Mass Effect 2 Online Config Editor
A config file editor for Mass Effect 2 that can be run in a browser so you don't have to run an .exe from some shady person on the internet.

You can find it at ipfs://bafybeih5cwvcpsmwjnl3xqnihrqc34gkavhvjrxnyor7ekxttpri2bua5e if you have a browser that supports IPFS (Brave, or any browser with IPFS Companion plugin).
Alternatively, you can access it via one of these gateways (may take a long time to load the first time if no one has used the tool in a while):
* https://ipfs.zoltu.io/ipfs/bafybeih5cwvcpsmwjnl3xqnihrqc34gkavhvjrxnyor7ekxttpri2bua5e/
* https://bafybeih5cwvcpsmwjnl3xqnihrqc34gkavhvjrxnyor7ekxttpri2bua5e.ipfs.cf-ipfs.com/
* https://bafybeih5cwvcpsmwjnl3xqnihrqc34gkavhvjrxnyor7ekxttpri2bua5e.ipfs.ipfs.io/

## Development
### Install
_this command will do an `npm install` for you_
```bash
npm run vendor
```

### Build
```bash
npm run build
```

### Watch
```bash
npx --no-install tsc --watch
```

### Serve
```bash
npm run serve
```

No bundler, pure ES2020 modules loaded directly into the browser.  It uses es-module-shims for import map polyfill in browsers without native support but otherwise doesn't use any special loaders, bundlers, file servers, etc.  Hosting is done via a static file server, you could use any static file server you wanted but I chose http-server because it is small and simple.

The one caveat with this project is the vendoring of dependencies.  To add a runtime dependency:
1. open `build/vendor.ts`
1. create an entry in the array at the top
1. specify the dependency package name (the thing you would put in the TS import statement)
1. specify the path within the package that should be copied (the whole folder will be vendored recursively, usually this is a dist or out folder)
1. the path (relative to the copied folder from previous step) to the index file for the package (usually `index.js` or `package-name.js` or `package-name.min.js`)
1. from the root directory of this project run `npm run vendor`

This will generate the runtime import map and embed it into your `index.html` file so the browser can turn `import { ... } from 'my-package'` into a fetch of `./vendor/my-package/dist/index-file.js`.
