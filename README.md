# Apply tag action

This action adds a tag to the repo if the tag does not already exist.

## Inputs

### `GITHUB_TOKEN`

**Required** Github secret key for repo

### `tag`

**Required** The tag to be applied

## Example usage

```yaml
uses: pchynoweth/action-apply-tag@master
with:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Leave this as is, it's automatically generated
  tag: v1.0.0
```
