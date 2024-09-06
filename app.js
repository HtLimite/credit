const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')
const session = require('koa-session')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// session 处理
const store = {
  storage: {},
  // 存取
  set(key){
    // 生成session 内置的 key
    this.storage[key] = session;
    // 也可以存储到数据库
  },
  // 获取
  get(key){
    // 从数据库获取
    return this.storage[key] || null;
  },
  // 销毁
  destroy(key){
    // 从数据库销毁
    delete this.storage[key];
    // 也可以从数据库中删除该session 释放空间
  }
}

// 处理session
app.use(session({store}, app))

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
