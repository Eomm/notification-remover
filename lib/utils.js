'use strict'

const expression = /bump (\S+) from (\S+) to (\S+)/i

function isDependabotTitle (notification) {
  const match = expression.exec(notification.subject.title)
  return match !== null
}

function isDependabotAuthor (pullRequestDetails) {
  return pullRequestDetails.user.login === 'dependabot[bot]' ||
  pullRequestDetails.user.login === 'dependabot-preview[bot]'
}

function isPullRequest (notification) {
  return notification.subject.type === 'PullRequest'
}

function isPullRequestState (pullRequestDetails, state) {
  if (state === 'all') {
    return true
  }
  return pullRequestDetails.state === state
}

function getPullRequestCoordinates (notification) {
  return {
    owner: notification.repository.owner.login,
    repo: notification.repository.name,
    number: notification.subject.url.split('/').pop()
  }
}

module.exports = {
  isPullRequest,
  isPullRequestState,
  isDependabotTitle,
  isDependabotAuthor,
  getPullRequestCoordinates
}
