/**
 * @file RIDL grammar for tree-sitter
 * @author Jacob Wolf <jacob@jacobwolf.dev>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
   name: 'ridl',
   rules: {
      // TODO: add the actual grammar rules
      source_file: ($) => 'hello',
   },
});
