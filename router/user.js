const router = require('koa-router')();
const UserController = require('../controller/user');
const multer = require('koa-multer')
const fs = require('fs')

//文件上传配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync('public/upload/')) {
            fs.mkdirSync('public/upload/');
        }
        cb(null, 'public/upload/');
    },
    filename: function (req, file, cb) {
        let fileFormat = (file.originalname).split(".");
        cb(null, Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
});

// 为router配置路由前缀 eg: /api/login
router.prefix('/api')

// 接口
router.post('/login', UserController.login)
router.post('/register', UserController.register)
router.get('/user', UserController.user)
router.post('/upload', multer({storage}).single('file'), UserController.upload)
router.get('/relevancePhoto', UserController.relevancePhoto)

module.exports = router;