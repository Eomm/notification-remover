'use strict'

const core = require('@actions/core')
const { debug, info } = require('@actions/core')
const { githubClient } = require('./lib/github-client')
const u = require('./lib/utils')

async function run () {
  try {
    const userToken = getInput('github-user-token', { mandatory: true })
    const daysAgo = getInput('days-ago', { defaultValue: 5 })
    const prState = getInput('pr-state', { defaultValue: 'closed' })

    const client = githubClient(userToken)

    const notifications = await client.readNotifications(daysAgo)

    const setAsRead = notifications
      .filter(u.isPullRequest)
      .filter(u.isDependabotTitle)

    if (setAsRead.length === 0) {
      info('No notifications to mark as read')
      return
    }
    debug(`Found ${setAsRead.length} to mark as read`)

    // read the PR details to check:
    //  - is it a PR from dependabot?
    //  - is it a PR open or closed?
    const pulls = setAsRead.map(u.getPullRequestCoordinates)
    const pullsDetails = await client.readPullRequests(pulls)

    const skip = pullsDetails
      .filter(pr => !u.isDependabotAuthor(pr)) // skip PRs not from dependabot
      .filter(pr => u.isPullRequestState(pr, prState)) // skip PRs not in the defined state
      .map(pr => pr.url)
    debug(`Found ${skip.length} notification to skip`)

    const markAsRead = setAsRead.filter(skipFilter)
    await client.markAllAsRead(markAsRead)
    info(`${markAsRead.length} notifications set as read`)

    function skipFilter (notification) {
      return !skip.includes(notification.subject.url)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()

function getInput (name, { mandatory, defaultValue } = {}) {
  const input = core.getInput(name) || defaultValue
  if (!input && mandatory === true) {
    throw new Error(`${name} is a required input`)
  }
  return input
}
