'use strict'

let co = require('co')
let cli = require('heroku-cli-util')

let secret = null

function secretMiddleware (middleware) {
  return function (response, cb) {
    secret = response.headers['heroku-webhook-secret']
    if (middleware) {
      middleware(response, cb)
    } else {
      cb()
    }
  }
}

function addSecretMiddleware (heroku) {
  let middleware = heroku.options.middleware
  heroku.options.middleware = secretMiddleware(middleware)
}

function * run (context, heroku) {
  addSecretMiddleware(heroku)

  yield cli.action(`Adding webhook to ${cli.color.app(context.app)}`, {}, heroku.request({
    path: `/apps/${context.app}/webhooks`,
    headers: {Accept: 'application/vnd.heroku+json; version=3.webhooks'},
    method: 'POST',
    body: {
      include: context.flags.include.split(',').map((s) => s.trim()),
      level: context.flags.level,
      secret: context.flags.secret,
      url: context.flags.url,
      authorization: context.flags.authorization
    }
  }))

  if (secret) {
    cli.styledHeader('Webhooks Signing Secret')
    cli.log(secret)
  }
}

module.exports = {
  topic: 'webhooks',
  command: 'add',
  flags: [
    {name: 'include', char: 'i', description: 'comma delimited webhook types', hasValue: true, required: true},
    {name: 'level', char: 'l', description: 'webhook notification level', hasValue: true, required: true},
    {name: 'secret', char: 's', description: 'comma delimited hook types', hasValue: true},
    {name: 'authorization', char: 't', description: 'authoriation header', hasValue: true},
    {name: 'url', char: 'u', description: 'url to send webhook to', hasValue: true, required: true}
  ],
  description: 'add a webhook to an app',
  help: `Example:

 $ heroku webhooks:add -i dyno -l notify -s 09928c40bf1b191b645174a19f7053d16a180da37332e719ef0998f4c0a2 -u https://example.com/hooks
`,
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(run))
}
