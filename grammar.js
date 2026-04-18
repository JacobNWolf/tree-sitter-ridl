/**
 * @file RIDL grammar for tree-sitter
 * @author Jacob Wolf <jacob@jacobwolf.dev>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
   name: 'ridl',

   extras: ($) => [/\s/, $.line_comment],

   supertypes: ($) => [$._declaration, $._type_expression, $._service_item],

   rules: {
      source_file: ($) => repeat($._declaration),

      _declaration: ($) =>
         choice(
            $.meta_declaration,
            $.enum_declaration,
            $.struct_declaration,
            $.error_declaration,
            $.service_declaration,
         ),

      // Header lines: webrpc = v1, name = example, version = v0.0.1 (spacing optional)
      meta_declaration: ($) => seq(field('key', $.identifier), '=', field('value', $.meta_value)),

      meta_value: ($) => choice($.string, $.dotted_meta_literal, $.identifier, token('-')),

      dotted_meta_literal: (_$) => token(/v[0-9]+(?:\.[0-9]+)+/),

      enum_declaration: ($) =>
         seq(
            'enum',
            field('name', $.identifier),
            ':',
            field('underlying_type', $._type_expression),
            repeat($.enum_variant),
         ),

      enum_variant: ($) => seq('-', field('name', $.identifier)),

      struct_declaration: ($) => seq('struct', field('name', $.identifier), repeat($.struct_field)),

      struct_field: ($) =>
         seq('-', field('name', $.identifier), ':', field('type', $._type_expression), repeat($.field_meta)),

      field_meta: ($) => seq('+', field('key', $.meta_path), '=', field('value', $.meta_value)),

      meta_path: ($) => sep1($.identifier, '.'),

      error_declaration: ($) =>
         seq(
            'error',
            field('code', $.number),
            field('name', $.identifier),
            field('message', $.string),
            'HTTP',
            field('http_status', $.number),
         ),

      service_declaration: ($) => seq('service', field('name', $.identifier), repeat($._service_item)),

      _service_item: ($) => choice($.annotation_line, $.service_method),

      // One or more @name or @name:value clauses (may repeat on the same line)
      annotation_line: ($) => prec.left(0, repeat1($.annotation_clause)),

      // Split so `@ a : b` requires `:` before value — avoids ending the name after one word when
      // more identifiers appear before ':' (e.g. `@ who dsa : J W T`).
      annotation_clause: ($) =>
         choice(
            prec(1, seq('@', field('name', $.annotation_word_list), ':', field('value', $.annotation_value))),
            seq('@', field('tag', $.identifier)),
         ),

      // Dotted segments (e.g. go.field) vs space-separated words (e.g. J W T) must not both
      // match a single identifier — dotted paths require at least one `.`.
      annotation_value: ($) => choice($.string, $.dotted_annotation_path, $.annotation_value_words),

      // Prefer consuming the full word run for values (e.g. `J W T`) before ending the clause.
      annotation_value_words: ($) => prec.right(0, repeat1($.identifier)),

      annotation_word_list: ($) => prec.left(0, repeat1($.identifier)),

      dotted_annotation_path: ($) => prec(1, seq($.identifier, repeat1(seq('.', $.identifier)))),

      service_method: ($) =>
         seq(
            '-',
            optional('stream'),
            field('name', $.method_name),
            field('parameters', $.parameter_list),
            optional(seq('=>', field('returns', $.method_returns))),
         ),

      // Allow split identifiers in stress-test samples (ridlfmt e1.ridl); real code uses one token.
      method_name: ($) => prec.left(0, repeat1($.identifier)),

      method_returns: ($) => choice(seq('stream', field('stream_payload', $.tuple_type)), $.tuple_type),

      parameter_list: ($) => seq('(', optional(seq($.parameter, repeat(seq(',', $.parameter)))), ')'),

      // Either `name: type` or a bare type (e.g. `(User)`)
      parameter: ($) =>
         choice(
            seq(field('name', $.identifier), ':', field('type', $._type_expression)),
            field('type', $._type_expression),
         ),

      tuple_type: ($) => seq('(', optional(seq($.tuple_field, repeat(seq(',', $.tuple_field)))), ')'),

      tuple_field: ($) =>
         choice(
            seq(field('name', $.identifier), ':', field('type', $._type_expression)),
            field('type', $._type_expression),
         ),

      _type_expression: ($) => choice($.map_type, $.array_type, $.identifier),

      map_type: ($) =>
         prec.right(2, seq('map', '<', field('key', $._type_expression), ',', field('value', $._type_expression), '>')),

      array_type: ($) => prec.right(1, seq('[', ']', field('element', $._type_expression))),

      identifier: (_$) => /[a-zA-Z_][a-zA-Z0-9_]*/,

      number: (_$) => /\d+/,

      string: (_$) => seq('"', field('content', token.immediate(/[^"\\]*/)), '"'),

      line_comment: (_$) => token(/#[^\n]*/),
   },

   conflicts: ($) => [[$.annotation_clause, $.annotation_word_list]],
});

/**
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} separator
 */
function sep1(rule, separator) {
   return seq(rule, repeat(seq(separator, rule)));
}
