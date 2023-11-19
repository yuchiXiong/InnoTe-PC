const Hexo = require('hexo');
const path = require('path');
const fs = require('fs');
const Promise = require('bluebird')

fs.promises.access = (path, mode) => {
  return new Promise((resolve, reject) => {
    try {
      fs.accessSync(path, mode);
      resolve(undefined)
    } catch (err) {
      reject(err);
    }
  })
}

const dirname = path.dirname(__filename);

var hexo = new Hexo(dirname);


hexo.init(
  {
    debug: true,
    config: [dirname, '\\_config.yml'].join('')
  }
).then(function () {
  hexo.call('s', {
    port: 4000,
    log: false,
    ip: undefined,
    compress: false,
    header: true,
    cache: false
  }).then(function () {

  })
}).catch(function (err) {
  console.error(err);
});