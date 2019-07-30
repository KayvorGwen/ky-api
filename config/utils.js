const getToken = require('jsonwebtoken')
const { keys } = require('./keys')

/** 
 * 校验token
 * @return Boolean
*/
exports.verToken = function(token){
    return new Promise((resolve,rejece) => {
        const info = getToken.verify(token.split(' ')[1], keys);
        resolve(info);
    })
}

/** 
 * 获取服务器日期
 * @return 2019-9-9 12:00:00
*/
exports.date = function () {
    const date = new Date();
    const years = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${years}-${month}-${day} ${hours}:${minutes}:${seconds}`
}