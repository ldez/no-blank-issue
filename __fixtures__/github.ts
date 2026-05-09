import type * as github from '@actions/github'
import { jest } from '@jest/globals'

export const context: typeof github.context = {
  payload: {},
  eventName: 'issues',
  sha: 'abc123',
  ref: 'refs/heads/main',
  workflow: 'test',
  action: 'opened',
  actor: 'test-actor',
  job: 'test-job',
  runNumber: 1,
  runId: 1,
  apiUrl: 'https://api.github.com',
  serverUrl: 'https://github.com',
  graphqlUrl: 'https://api.github.com/graphql',
  repo: {
    owner: 'test-owner',
    repo: 'test-repo'
  },
  issue: {
    owner: 'test-owner',
    repo: 'test-repo',
    number: 0
  }
}

export const getOctokit = jest.fn<typeof github.getOctokit>()
