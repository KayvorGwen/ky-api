const jwt = require('jsonwebtoken')
const secret = require('../config/keys');
const util = require('util')
const verify = util.promisify(jwt.verify)

/**
 * 判断token是否可用
 */
module.exports = function () {
    return async function (ctx, next) {
        try {
            const token = ctx.header.authorization;  // 获取jwt
            if (token) {
                let payload
                try {
                    // 解密payload，获取用户名和ID,密码
                    // username、password、userId
                    payload = await verify(token.split(' ')[1], secret.key);
                    ctx.user = payload;
                } catch (err) {
                    err.status = 401;
                    ctx.body = {
                        errcode: 99,
                        errmsg: 'token verify fail'
                    }
                }
            }
            await next()
        } catch (err) {
            if (err.status === 401) {
                ctx.status = 401;
                ctx.body = {
                    errcode: 99,
                    errmsg: 'unauthorized，请求需要用户的身份认证！'
                };
            } else {
                err.status = 404;
                ctx.body = {
                    errcode: 99,
                    errmsg: '不存在的用户'
                };
            }
        }
    }
}
