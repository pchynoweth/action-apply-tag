const core = require('@actions/core');
const github = require('@actions/github');
const { graphql } = require("@octokit/graphql");

async function hasTag(tag, owner, repo, auth) {
  const { repository } = await graphql(`query lastIssues($owner: String!, $repo: String!, $tag: String!) {
    repository(owner:$owner, name:$repo) {
      refs(refPrefix:"refs/tags/", first: 1, query: $tag) {
        edges {
          node {
            name
          }
        }
      }
    }
  }`, {
    owner,
    repo,
    tag,
    headers: {
      authorization: 'token ' + auth
    }
  });
  return repository.refs.edges.length !== 0;
}

async function applyTag(tag, owner, repo, auth) {
  try {
    if (! await hasTag(tag, owner, repo, auth)) {
      console.log(`Tag ${tag} not found in repo`);

      const octo = new github.getOctokit(auth);
      const newTag = await octo.rest.git.createTag({
        owner,
        repo,
        tag,
        message: `Release ${tag}`,
        object: process.env.GITHUB_SHA,
        type: 'commit'
      });

      this._sha = newTag.data.sha
      core.warning(`Created new tag: ${newTag.data.tag}`)

      try {
        await octo.rest.git.createRef({
          owner,
          repo,
          ref: `refs/tags/${newTag.data.tag}`,
          sha: newTag.data.sha
        });
      } catch (e) {
        core.warning({
          owner,
          repo,
          ref: `refs/tags/${newTag.data.tag}`,
          sha: newTag.data.sha
        })

        throw e;
      }

      core.setOutput('tagcreated', 'yes');
    }
    else {
      console.log(`Tag ${tag} already in repo`);
      core.setOutput('tagcreated', 'no');
    }
  }
  catch (error) {
    core.setFailed(error.message);
    core.setOutput('tagcreated', 'no');
  }
}

const auth = core.getInput('GITHUB_TOKEN', { required: true });
const { owner, repo } = github.context.repo;
const tag = core.getInput('tag', { required: true });

applyTag(tag, owner, repo, auth);