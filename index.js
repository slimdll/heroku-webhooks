'use strict'
exports.topic = {
  name: 'heroku',
  // this is the help text that shows up under `heroku help`
  description: 'a topic for the webhooks plugin'
}

exports.commands = [
  require('./commands/webhooks/add.js'),
  require('./commands/webhooks/index.js'),
  require('./commands/webhooks/remove.js'),
  require('./commands/webhooks/update.js')
]