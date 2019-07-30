const compose = require('koa-compose')
const glob = require('glob')
const { resolve } = require('path')


/** 
 * 将当前目录下多个路由合拼挂载在app上
*/
const registerRouter = () => {
    let routers = [];
    glob.sync(resolve(__dirname, './', '**/*.js'))
        // 过滤掉index.js
        .filter(value => (value.indexOf('index.js') === -1))
        .map(router => {
            routers.push(require(router).routes())
            routers.push(require(router).allowedMethods())
        })
    return compose(routers)
}

module.exports = registerRouter