'use strict'

const tap = require('tap')

const {
  isPullRequest,
  isPullRequestState,
  isDependabotTitle,
  isDependabotAuthor,
  getPullRequestCoordinates
} = require('../lib/utils')

const notifications = require('./fixtures/notification-list.json')
const pullRequests = require('./fixtures/pull-requests-details.json')

tap.test('filter not prs', t => {
  const onlyPr = notifications.filter(isPullRequest)
  t.notSame(onlyPr.length, notifications.length)
  t.end()
})

tap.test('filter not prs', t => {
  const onlyOpen = pullRequests.filter(pr => isPullRequestState(pr, 'open'))
  const onlyClosed = pullRequests.filter(pr => isPullRequestState(pr, 'closed'))
  const all = pullRequests.filter(pr => isPullRequestState(pr, 'all'))
  t.same(pullRequests, all, 'no filter')
  t.same(onlyOpen.length, 1)
  t.same(onlyClosed.length, 1)
  t.end()
})

tap.test('dependabot titles', t => {
  [
    ['chore(deps-dev): bump fastify from 3.18.0 to 3.18.1', true],
    ['chore(deps-dev): bump fastify from 1.1.1-foo to 1.1.2', true],
    ['chore(deps-dev): bump fastify from 1.2.3 to 2.0.0-pre', true],
    ['chore(deps-dev): bump fastify from 0.0.1-foo to 0.1.0', true],
    ['chore(deps-dev): bump fastify from 3.18.0 to 3.19.1', true],
    ['chore(deps-dev): bump fastify from 3.18.0 to 4.18.1', true],
    ['chore(deps-dev): bump fastify from 3.18.0-alpha to 3.18.1-beta', true],
    ['chore(deps-dev): bump fastify from 3.18.0-alpha to 3.18.2', true],
    ['chore(deps-dev): bump fastify from 3.18.0 to 3.18.0', true],
    ['chore(deps-dev): bump fastify from 3.18.0 to 3.18.1 in /packages/a', true]
  ].forEach(([title, expected]) => {
    t.same(isDependabotTitle({ subject: { title } }), expected, title)
  })
  t.end()
})

tap.test('dependabot authors', t => {
  const dependabotPrs = pullRequests.filter(isDependabotAuthor)
  t.same(dependabotPrs, pullRequests)
  t.end()
})

tap.test('get pull request coordinates', t => {
  const coordinates = notifications.map(getPullRequestCoordinates)
  t.same(coordinates.find(c => c.repo === 'fastify-compress'), {
    repo: 'fastify-compress',
    owner: 'fastify',
    number: '199'
  })
  t.end()
})
