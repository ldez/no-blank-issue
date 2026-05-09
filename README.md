# no-blank-issue

![Linter](https://github.com/ldez/no-blank-issue/actions/workflows/linter.yml/badge.svg)
![CI](https://github.com/ldez/no-blank-issue/actions/workflows/ci.yml/badge.svg)
![Check dist/](https://github.com/ldez/no-blank-issue/actions/workflows/check-dist.yml/badge.svg)
![CodeQL](https://github.com/ldez/no-blank-issue/actions/workflows/codeql-analysis.yml/badge.svg)

A GitHub Action that automatically closes newly opened issues that have no
labels, indicating that the issue forms have not been used.

## How It Works

When a new issue is opened, this action checks whether it has at least one
label.

GitHub can automatically assign labels when using
[issue forms](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository#creating-issue-forms).

If the issue has **no labels**, the action will:

1. Post a comment explaining that the issue forms must be used.
2. Close the issue as **not planned**.

## Usage

Add the following workflow to your repository at
`.github/workflows/no-blank-issue.yml`:

```yaml
name: No Blank Issues

on:
  issues:
    types:
      - opened
      - reopened

permissions:
  issues: write

jobs:
  no-blank-issue:
    name: No Blank Issue
    runs-on: ubuntu-slim

    steps:
      - name: Check Issue Labels
        uses: ldez/no-blank-issue@v1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Inputs

| Input          | Description                      | Required | Default               |
| -------------- | -------------------------------- | -------- | --------------------- |
| `github-token` | GitHub token used for API calls. | `true`   | `${{ github.token }}` |

## Development

### Initial Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the tests:

   ```bash
   npm test
   ```

3. Bundle for distribution:

   ```bash
   npm run bundle
   ```

### Publishing a New Release

This project includes a helper script, [`script/release`](./script/release),
designed to streamline the process of tagging and pushing new releases for
GitHub Actions.

GitHub Actions allows users to select a specific version of the action to use,
based on release tags. This script simplifies this process by performing the
following steps:

1. **Retrieving the latest release tag:** The script starts by fetching the most
   recent SemVer release tag of the current branch, by looking at the local data
   available in your repository.
2. **Prompting for a new release tag:** The user is then prompted to enter a new
   release tag. To assist with this, the script displays the tag retrieved in
   the previous step, and validates the format of the inputted tag (vX.X.X). The
   user is also reminded to update the version field in package.json.
3. **Tagging the new release:** The script then tags a new release and syncs the
   separate major tag (e.g. v1, v2) with the new release tag (e.g. v1.0.0,
   v2.1.2). When the user is creating a new major release, the script
   auto-detects this and creates a `releases/v#` branch for the previous major
   version.
4. **Pushing changes to remote:** Finally, the script pushes the necessary
   commits, tags and branches to the remote repository. From here, you will need
   to create a new release in GitHub so users can easily reference the new tags
   in their workflows.
