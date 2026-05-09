/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core and github modules are mocked in
 * this test, so that the actual '@actions/core' and '@actions/github' modules
 * are not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as githubFixture from '../__fixtures__/github.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => githubFixture)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

const mockCreateComment = jest.fn<() => Promise<void>>()
const mockUpdateIssue = jest.fn<() => Promise<void>>()

const mockOctokit = {
  rest: {
    issues: {
      createComment: mockCreateComment,
      update: mockUpdateIssue
    }
  }
}

describe('main.ts', () => {
  beforeEach(() => {
    core.getInput.mockReturnValue('fake-token')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    githubFixture.getOctokit.mockReturnValue(mockOctokit as any)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Does nothing when the payload has no issue', async () => {
    githubFixture.context.payload = {}

    await run()

    expect(core.debug).toHaveBeenCalledWith(
      'No issue found in the event payload. Skipping.'
    )
    expect(mockCreateComment).not.toHaveBeenCalled()
    expect(mockUpdateIssue).not.toHaveBeenCalled()
  })

  it('Does nothing when the issue already has labels', async () => {
    githubFixture.context.payload = {
      issue: {
        number: 42,
        labels: [{ name: 'bug' }]
      }
    }

    await run()

    expect(core.info).toHaveBeenCalledWith(
      'Issue #42 has 1 label(s). No action needed.'
    )
    expect(mockCreateComment).not.toHaveBeenCalled()
    expect(mockUpdateIssue).not.toHaveBeenCalled()
  })

  it('Closes the issue when it has no labels', async () => {
    githubFixture.context.payload = {
      issue: {
        number: 7,
        labels: [],
        user: { login: 'octocat' }
      }
    }

    await run()

    expect(mockCreateComment).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      issue_number: 7,
      body: `Hi @octocat, thanks for opening an issue.\n\nIt looks like you did not use one of the provided issue forms when creating this issue.\nTo help us triage and respond efficiently, please open a new issue using one of the available issue forms.\n\nThis issue is being closed automatically.`
    })
    expect(mockUpdateIssue).toHaveBeenCalledWith({
      owner: 'test-owner',
      repo: 'test-repo',
      issue_number: 7,
      state: 'closed',
      state_reason: 'not_planned'
    })
    expect(core.info).toHaveBeenCalledWith('Issue #7 has been closed.')
  })

  it('Falls back to @there when user is missing', async () => {
    githubFixture.context.payload = {
      issue: {
        number: 8,
        labels: [],
        user: null
      }
    }

    await run()

    expect(mockCreateComment).toHaveBeenCalledWith(
      expect.objectContaining({
        issue_number: 8,
        body: expect.stringContaining('Hi @there')
      })
    )
  })

  it('Closes the issue when the labels field is undefined', async () => {
    githubFixture.context.payload = {
      issue: {
        number: 9,
        labels: undefined,
        user: { login: 'octocat' }
      }
    }

    await run()

    expect(mockCreateComment).toHaveBeenCalledWith(
      expect.objectContaining({ issue_number: 9 })
    )
    expect(mockUpdateIssue).toHaveBeenCalledWith(
      expect.objectContaining({ issue_number: 9, state: 'closed' })
    )
  })

  it('Sets a failed status when an error is thrown', async () => {
    githubFixture.context.payload = {
      issue: {
        number: 10,
        labels: [],
        user: { login: 'octocat' }
      }
    }

    mockCreateComment.mockRejectedValueOnce(new Error('API error'))

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('API error')
  })
})
