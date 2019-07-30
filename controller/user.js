const jwt = require('jsonwebtoken')
const uuid = require('uuid/v1');
const common = require('../config/common.js')
const config = require('../config/default.js')
const { date } = require('../config/utils')
// const mysql = require('mysql2')
const mysql = require('mysql2/promise')
const sqlConfig = require('../sql/index')
// const pool = mysql.createPool(sqlConfig)
// const db = pool.promise()

const getIPAdress = require('../config/getIpAddress')

const db = mysql.createPool(sqlConfig)

const secret = require('../config/keys')

class UserController{

    /**
     * 登录
     * @param username: 用户名
     * @param password: 密码
    */
    async login(ctx) {
        let msg, status = 99, token, userId;
        const {username, password} = ctx.request.body;
        if (!common.name_reg.test(username)) {
            msg = "用户名必须" + common.name_txt;
        } else if (!common.pass_reg.test(password)) {
            msg = "密码必须" + common.pass_txt;
        } else {
            try {
                const [rows] = await db.execute('SELECT * FROM `user_table` where `username`=?', [username]);
                if (rows.length > 0) {
                    userId = rows[0].userid;
                    msg = rows[0].password == password ? '登录成功' : '密码出错';
                    status = rows[0].password == password ? 0 : 99;
                    token = jwt.sign({username, password, userId}, secret.key, {expiresIn: '24h'}) //token签名 有效期为24小时
                } else {
                    msg = "此用户不存在";
                }
            } catch (err) {
                console.log(`打印登录接口报错信息：${err.message}`);
            }
        }
        ctx.body = {
            errcode: status,
            errmsg: msg,
            data:{userId, token}
        }
    }

    /**
     * 注册
     * @param username: 用户名
     * @param password: 密码
    */
    async register(ctx) {
        let msg, status = 99, token, userId;
        const {username, password} = ctx.request.body;
        if (!common.name_reg.test(username)) {
            msg = "用户名必须" + common.name_txt;
        } else if (!common.pass_reg.test(password)) {
            msg = "密码必须" + common.pass_txt;
        } else {
            try {
                //先检查是否占用帐号
                const [rows] = await db.execute('SELECT id FROM `user_table` where `username`=?', [username]);
                if (rows.length > 0) {
                    msg = '帐号已经被占用！';
                } else {
                    userId = uuid();
                    const time = date();
                    const [result] = await db.execute('INSERT INTO `user_table` (userid, username, password, date, photo_id) VALUES (?, ?, ?, ?, ?)', [userId, username, password, time, '']);
                    status = (result.affectedRows === 1) ? 0 : 99;
                    msg = (result.affectedRows === 1) ? '注册成功' : '注册失败';
                    token = jwt.sign({username, password, userId}, secret.key, {expiresIn: '24h'}) //token签名 有效期为24小时
                }
            } catch (err) {
                console.log(`打印注册接口报错信息：${err.message}`);
            }
        }

        ctx.body = {
            errcode: status,
            errmsg: msg,
            data: {
                userId,
                token
            }
        }
    }

    /**
     * 获取首页信息
    */
    async user(ctx) {
        let errmsg = '', errcode = 99, data;
        const { userId } = ctx.user;
        if (!userId) {
            errmsg = '缺少userId参数';
        } else {
            try {
                const address = getIPAdress();
                const [results] = await db.execute('SELECT photo_id FROM `user_table` where `userid`=?', [userId]);
                errcode = 0;
                if (results[0].photo_id) {
                    const photoId = results[0].photo_id;
                    const [photo] = await db.execute('SELECT avator FROM `photo` where `photo_id`=?', [photoId]);
                    data = {user_img: `http://${address}:${config.port}/${photo[0].avator}`};
                } else {
                    data = {user_img: ''};
                }
            } catch (e) {
                console.log(`打印首页报错信息：${e.message}`);
                errmsg = e.message;
            }
        }
        ctx.body = {
            errcode,
            errmsg,
            data
        }
    }

    /**
     * 上传头像
     * @return user_img: 图片路径，photoId：图片id
    */
    async upload(ctx) {
        const file = ctx.req.file;
        if (!file) {
            ctx.body = {
                errcode: 99,
                errmsg: '未接收到图片'
            }
        } else {
            const {originalname, destination, filename, mimetype, path, size} = ctx.req.file;
            if(size > common.upFile_maxSize || !common.upFile_accept.test(mimetype)) {
                errmsg = size > common.upFile_maxSize ? '上传文件大小超出':'非法上传文件格式';
                fs.unlinkSync(path);//同步删除文件
                ctx.body = {
                    errcode: 99,
                    errmsg
                }
            } else {
                try {
                    const address = getIPAdress();
                    const imgDestination = destination.replace('public/', '');
                    const newPath = `${imgDestination}${filename}`;
                    const time = date();
                    const photoId = uuid();
                    const [result] = await db.execute('INSERT INTO `photo` (avator, avator_size, avator_name, avator_type, date, photo_id) VALUES (?, ?, ?, ?, ?, ?)', [newPath, size, filename, mimetype, time, photoId])
                    const status = (result.affectedRows === 1) ? 0 : 99;
                    const msg = (result.affectedRows === 1) ? '上传成功' : '上传失败';
                    ctx.body = {
                        errcode: status,
                        errmsg: msg,
                        data: {
                            user_img: `http://${address}:${config.port}/${newPath}`,
                            photoId
                        }
                    }
                } catch (err) {
                    console.log('打印上传图片接口报错信息：', err.message);
                    ctx.body = {
                        errcode: 99,
                        errmsg: err.message
                    }
                }
            }
        }
    }

    /**
     * 用户关联头像
    */
    async relevancePhoto(ctx) {
        let errmsg, errcode = 99, data;
        const { photoId } = ctx.query;
        if (!photoId) {
            errmsg = '缺少photoId参数';
        } else {
            try {
                const { userId } = ctx.user;
                const [result] = await db.execute('UPDATE `user_table` SET photo_id=? where userid=?', [photoId, userId]);
                errmsg = result.affectedRows === 1 ? '关联图片成功' : '关联图片失败';
                errcode = result.affectedRows === 1 ? 0 : 99;
            } catch (err) {
                console.log('用户关联头像接口报错信息：', err.message);
                errmsg = err.message;
            }
        }
        ctx.body = {
            errcode,
            errmsg
        }
    }
}

module.exports = new UserController()