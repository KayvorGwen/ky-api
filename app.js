const Koa = require('koa')
const app = new Koa()
const config = require('./config/default.js')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const cors = require('koa2-cors')
const router = require('koa-router')()
const user = require('./router/user');
const err = require('./middlewares/tokenError')

const registerRouter = require('./router');


const secret = require('./config/keys')
//token
const jwtKoa = require('koa-jwt')


// 校验token
onerror(app)

app.use(err())

const errorHandle = require('./middlewares/errorHandle.js')
app.use(errorHandle)

// app.use(cors())
app.use(cors({
  origin: function(ctx) {
    return '*';

    // if (ctx.url.toString().indexOf('/api') === 0) {
    //     return 'http://127.0.0.1:5000'; // 只允许 http://localhost:5000 这个域名的请求
    //     // return '*';
    // }
    // // return '*'; // 允许来自所有域名请求
    // return false;
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
// router.use('*', user.routes());
// app.use(router.routes())
// app.use(router.allowedMethods())

// 挂载多个路由
app.use(registerRouter())


// error-handling
app.on('error', (err, ctx) => {
  console.error('报错信息以下：')
  console.error('server error', err, ctx)
});

app.listen(config.port, () => {
	console.log(`成功监听端口：127.0.0.1:${config.port}`)
});

module.exports = app