# Release by pushing a version tag; publish to GitHub Packages

Same registry as the old repo's ADR-0003: `publishConfig.registry` is `https://npm.pkg.github.com`, so the package installs under the `@lvigerust` scope without the public npm registry. Consumers need an `@lvigerust:registry=https://npm.pkg.github.com` line and a token with `read:packages` in their `.npmrc`.

The release process is new. Bump `version` in `package.json`, commit, then push a tag `vX.Y.Z` for that version. `release.yml` runs CI, checks that the tag matches `package.json`, publishes with `GITHUB_TOKEN`, and creates a GitHub release with generated notes, which take the place of a CHANGELOG.

## Considered Options

- **Changesets with a "Version Packages" PR (the old monorepo).** That exists to version several packages and their internal dependencies together. With one package, it adds a config, a bot PR and a dependency without solving a problem.
- **Publishing manually from a laptop.** Simplest, but nothing guarantees that what's published passed CI, or came from a commit on GitHub.
- **Push a tag (chosen).** One deliberate act per release, and the published tarball is built in CI from the tagged commit.
