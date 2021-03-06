'use strict'
/* globals describe it beforeEach cli */

let expect = require('chai').expect
let nock = require('nock')
let certs = require('../../../../commands/webhooks/deliveries/index')

describe('heroku webhooks:deliveries', function () {
  beforeEach(function () {
    cli.mockConsole()
    nock.cleanAll()
  })

  it('# lists deliveries', function () {
    let mock = nock('https://api.heroku.com')
      .get('/apps/example/webhook-deliveries')
      .reply(200, [{
        id: '66666666-6666-6666-6666-666666666666',
        event: {
          id: '55555555-5555-5555-5555-555555555555',
          include: 'api:build'
        },
        webhook: {
          id: '44444444-4444-4444-4444-444444444444',
          level: 'notify'
        },
        status: 'pending',
        num_attempts: 4,
        created_at: '2017-08-17T20:22:38Z'
      }, {
        id: '99999999-9999-9999-9999-999999999999',
        event: {
          id: '88888888-8888-8888-8888-888888888888',
          include: 'api:build'
        },
        webhook: {
          id: '77777777-7777-7777-7777-777777777777',
          level: 'notify'
        },
        last_attempt: {
          code: 401,
          error_class: 'Foobar'
        },
        status: 'retrying',
        num_attempts: 4,
        created_at: '2017-08-17T20:22:37Z',
        next_attempt_at: '2017-08-17T20:22:39Z'
      }
    ])

    return certs.run({app: 'example', args: {}, flags: {}}).then(function () {
      mock.done()
      expect(cli.stderr).to.equal('')
      expect(cli.stdout).to.equal(
`Delivery ID                           Created               Status    Include    Level   Attempts  Code  Error   Next Attempt
────────────────────────────────────  ────────────────────  ────────  ─────────  ──────  ────────  ────  ──────  ────────────────────
99999999-9999-9999-9999-999999999999  2017-08-17T20:22:37Z  retrying  api:build  notify  4         401   Foobar  2017-08-17T20:22:39Z
66666666-6666-6666-6666-666666666666  2017-08-17T20:22:38Z  pending   api:build  notify  4
`)
    })
  })

  it('# lists empty deliveries', function () {
    let mock = nock('https://api.heroku.com')
      .get('/apps/example/webhook-deliveries')
      .reply(200, [])

    return certs.run({app: 'example', args: {}, flags: {}}).then(function () {
      mock.done()
      expect(cli.stderr).to.equal('')
      expect(cli.stdout).to.equal('example has no deliveries\n')
    })
  })

  it('# lists deliveries', function () {
    let mock = nock('https://api.heroku.com')
      .get('/pipelines/example/webhook-deliveries')
      .reply(200, [{
        id: '66666666-6666-6666-6666-666666666666',
        event: {
          id: '55555555-5555-5555-5555-555555555555',
          include: 'api:build'
        },
        webhook: {
          id: '44444444-4444-4444-4444-444444444444',
          level: 'notify'
        },
        status: 'pending',
        num_attempts: 4,
        created_at: '2017-08-17T20:22:38Z'
      }
    ])

    return certs.run({args: {}, flags: {pipeline: 'example'}}).then(function () {
      mock.done()
      expect(cli.stderr).to.equal('')
      expect(cli.stdout).to.equal(
`Delivery ID                           Created               Status   Include    Level   Attempts  Code  Error  Next Attempt
────────────────────────────────────  ────────────────────  ───────  ─────────  ──────  ────────  ────  ─────  ────────────
66666666-6666-6666-6666-666666666666  2017-08-17T20:22:38Z  pending  api:build  notify  4
`)
    })
  })

  it('# lists empty deliveries', function () {
    let mock = nock('https://api.heroku.com')
      .get('/pipelines/example/webhook-deliveries')
      .reply(200, [])

    return certs.run({args: {}, flags: {pipeline: 'example'}}).then(function () {
      mock.done()
      expect(cli.stderr).to.equal('')
      expect(cli.stdout).to.equal('example has no deliveries\n')
    })
  })
})
