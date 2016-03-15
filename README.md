# pbr
> A particle based renderer

## Build Setup
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:3000
npm run dev

# build for production with minification
npm run build
```

## Dependencies
Three.js and its plugins are served from `src/vendor` directory.
- Three.js (r74)
- OrbitControls.js

## Test data
For easy development and check the rendering result, there should be test point files in
`assets/kvsml`.
Currently this program uses only `test_coord.dat` and `test_value.dat` since the usage of
`test_normal.dat` is unsure.
