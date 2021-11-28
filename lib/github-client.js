'use strict'

const github = require('@actions/github')
const { debug, info } = require('@actions/core')

const pMap = require('p-map')

function githubClient (authToken) {
  const octokit = github.getOctokit(authToken)

  return {
    readNotifications,
    readPullRequests,
    markAllAsRead
  }

  async function readNotifications (daysAgo = 5) {
    let notifications = []
    const since = subtractDays(daysAgo)
    let page = 0
    let hasNextPage
    do {
      const { data, headers } = await octokit.rest.activity.listNotificationsForAuthenticatedUser({
        per_page: 100,
        page: ++page,
        since
      })
      debug(`fetched notification page ${page}`)

      hasNextPage = headers.link && headers.link.includes('rel="next"')
      notifications = notifications.concat(data)
    } while (hasNextPage)
    info(`Read ${notifications.length} unread notifications since ${since}`)
    return notifications
  }

  async function readPullRequests (pulls) {
    return pMap(pulls, readPullRequest, { concurrency: 3 })
  }
  async function readPullRequest (pull) {
    // https://docs.github.com/en/rest/reference/pulls#get-a-pull-request
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner: pull.owner,
      repo: pull.repo,
      pull_number: pull.number
    })

    return pullRequest
  }

  async function markAllAsRead (notifications) {
    return pMap(notifications, markAsRead, { concurrency: 3 })
  }
  async function markAsRead (notification, i) {
    const threadId = notification.url.split('/').pop()
    return octokit.rest.activity.markThreadAsRead({
      thread_id: threadId
    })
  }
}

module.exports = { githubClient }

function subtractDays (days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0] + 'T00:00:00Z'
}
