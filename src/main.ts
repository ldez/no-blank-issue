import * as core from '@actions/core'
import * as github from '@actions/github'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token', { required: true })

    const { payload, repo } = github.context

    if (!payload.issue) {
      core.debug('No issue found in the event payload. Skipping.')
      return
    }

    const issue = payload.issue

    if (issue.labels && issue.labels.length > 0) {
      core.info(
        `Issue #${issue.number} has ${issue.labels.length} label(s). No action needed.`
      )
      return
    }

    core.info(`Issue #${issue.number} has no labels. Closing with a message.`)

    const octokit = github.getOctokit(token)

    const author = issue.user?.login ?? 'there'

    await octokit.rest.issues.createComment({
      owner: repo.owner,
      repo: repo.repo,
      issue_number: issue.number,
      body: `Hi @${author}, thanks for opening an issue.\n\nIt looks like you did not use one of the provided issue forms when creating this issue.\nTo help us triage and respond efficiently, please open a new issue using one of the available issue forms.\n\nThis issue is being closed automatically.`
    })

    await octokit.rest.issues.update({
      owner: repo.owner,
      repo: repo.repo,
      issue_number: issue.number,
      state: 'closed',
      state_reason: 'not_planned'
    })

    core.info(`Issue #${issue.number} has been closed.`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
