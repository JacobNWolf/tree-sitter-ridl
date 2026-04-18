# tree-sitter-ridl

[Tree-sitter](https://tree-sitter.github.io/) grammar for [WebRPC RIDL](https://github.com/webrpc/webrpc) (`.ridl`).

## Generated artifacts

The parser under `src/` (`parser.c`, `grammar.json`, `node-types.json`, etc.) is **checked in** so consumers can clone the repo without running `tree-sitter generate`. Regenerate after changing `grammar.js` and commit the updated `src/`.

## Requirements

- **Node.js** 18+ (for tooling and Node bindings).
- **tree-sitter CLI** — install [via Cargo](https://github.com/tree-sitter/tree-sitter/blob/master/crates/cli/README.md) (`cargo install --locked tree-sitter-cli`) or use the `tree-sitter-cli` devDependency (`pnpm exec tree-sitter …`). The npm package downloads a native CLI binary in its install script; if that binary is missing, use the Cargo CLI instead.

## Setup

```bash
pnpm install
```

If `pnpm install` fails while compiling the native Node binding, run `tree-sitter generate` first so `src/parser.c` exists, then install again.

If `pnpm test` fails with `spawn ... tree-sitter ENOENT`, the `tree-sitter-cli` package did not download its native binary (for example after `pnpm install --ignore-scripts`). Run `node node_modules/tree-sitter-cli/install.js` from the project root, or use a [Cargo-installed](https://github.com/tree-sitter/tree-sitter/blob/master/crates/cli/README.md) `tree-sitter` on your `PATH` and invoke `tree-sitter test` directly.

## Scripts

| Script            | Description                                      |
| ----------------- | ------------------------------------------------ |
| `pnpm run generate` | Run `tree-sitter generate` (updates `src/`).   |
| `pnpm test`       | Run corpus tests (`tree-sitter test`).           |
| `pnpm run test:node` | Node binding smoke test (needs native addons). |

## Development

1. Edit `grammar.js`.
2. Run `pnpm run generate`.
3. Run `pnpm test` (and `pnpm run test:node` when native bindings build on your Node version).

Sample files under `test/fixtures/` include upstream examples (e.g. ridlfmt `e1.ridl`) used while developing the grammar.

## References

- [vscode-ridl](https://github.com/webrpc/vscode-ridl) syntax and `test.ridl`
- [ridlfmt examples](https://github.com/webrpc/ridlfmt/tree/main/_examples)
