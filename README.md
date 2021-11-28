# notification-remover

Clean your inbox notification, on the go, when you need!

This GitHub Action let you to remove all the BOT notification on your inbox!
Supported bots:

- [x] [Dependabot](https://github.blog/2020-06-01-keep-all-your-packages-up-to-date-with-dependabot/)
- [ ] [Renovate](https://github.com/renovatebot/renovate)

## Installation

To allow GitHub Actions to mark as read **your** notifications, you need to create a [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
The **only** permission needed is `notifications`.

After you have created the token, you can use it to use this GitHub Action.

1. Create a new repository. (_I suggest to use your GitHub profile repository_)[https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/managing-your-profile-readme]
1. Add your personal access token to the repository's secrets as `USER_TOKEN`.
1. Create a new GitHub Workflow as in the `Usage` section.

## Usage

This minimal example adds a new workflow to your repository that you can use to remove all the BOT notification on your inbox.
This simple workflow can be triggered by a `curl` command or a chron job: it is a matter of your choice!

```yml
name: notification-remover

on:
  workflow_dispatch:

jobs:
  notification-remover:
    runs-on: ubuntu-latest
    steps:
      - uses: Eomm/notification-remover@v1
        with:
          github-user-token: ${{ secrets.USER_TOKEN }}
```

Than you will be able to trigger the workflow by a `curl` command:

```sh
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token {user_token}" \
  https://api.github.com/repos/{owner}/{reponame}/actions/workflows/notification-remover/dispatches \
  -d '{"ref":"main"}'
```

A more complete workflow can be as follow:

```yml
name: notification-remover

on:
  workflow_dispatch:
    inputs:
      days-ago:
        default: 5
      pr-state:
        default: 'all'

jobs:
  notification-remover:
    runs-on: ubuntu-latest
    steps:
      - uses: Eomm/notification-remover@v1
        with:
          github-user-token: ${{ secrets.USER_TOKEN }}
          pr-state: ${{ github.event.inputs.pr-state }}
          days-ago: ${{ github.event.inputs.days-ago }}
```

Give it a try!

### Arguments

| Name | Default | Description |
| ---- | ------- | ----------- |
| `github-user-token` | - | (required) Personal access token to use to access GitHub. |
| `days-ago` | `5` | Number of days to look back for notifications. |
| `pr-state` | `closed` | Mark as read the notification only if the PR is in the selected stage. Possible values: `closed`, `open`, `all` |

## Development this Action

Read the [developer documentation](https://github.com/actions/javascript-action#package-for-distribution).

## License

Copyright [Manuel Spigolon](https://github.com/Eomm), Licensed under [MIT](./LICENSE).
