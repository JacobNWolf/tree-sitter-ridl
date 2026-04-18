/**
 * @file RIDL grammar for tree-sitter (WebRPC RIDL surface; aligned with webrpc/schema/ridl)
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
            $.import_declaration,
            $.enum_declaration,
            $.type_alias_declaration,
            $.struct_declaration,
            $.error_declaration,
            $.service_declaration,
         ),

      // Header lines: webrpc | name | version | basepath = value (spacing optional)
      meta_declaration: ($) => seq(field('key', $.identifier), '=', field('value', $.meta_value)),

      // Unquoted values: words with hyphens (schema names), commas (go struct tags), etc.
      meta_value: ($) => choice($.string, $.dotted_meta_literal, $.meta_word, token('-')),

      dotted_meta_literal: (_$) => token(/v[0-9]+(?:\.[0-9]+)+/),

      meta_word: (_$) => token(/[a-zA-Z0-9_.][a-zA-Z0-9_,.-]*/),

      // import path/to.ridl [- Member]*
      // import
      //   - path/to.ridl
      import_declaration: ($) =>
         seq(
            'import',
            choice(seq(field('path', $.import_path), repeat($.import_member)), repeat1($.import_dashed_line)),
         ),

      import_dashed_line: ($) => seq('-', field('path', $.import_path)),

      import_member: ($) => seq('-', field('member', $.import_member_value)),

      import_member_value: ($) => choice($.string, $.identifier, $.import_path_raw),

      import_path: ($) => choice($.string, $.import_path_raw),

      import_path_raw: (_$) => token(/[a-zA-Z0-9_./~-]+/),

      enum_declaration: ($) =>
         seq(
            'enum',
            field('name', $.identifier),
            ':',
            field('underlying_type', $._type_expression),
            repeat($.enum_variant),
         ),

      enum_variant: ($) =>
         seq('-', field('name', $.identifier), optional(seq('=', field('value', $.enum_variant_value)))),

      enum_variant_value: ($) => choice($.string, $.number, $.dotted_meta_literal, $.identifier),

      type_alias_declaration: ($) =>
         seq('type', field('name', $.identifier), ':', field('type', $._type_expression), repeat($.field_meta)),

      struct_declaration: ($) => seq('struct', field('name', $.identifier), repeat($.struct_field)),

      struct_field: ($) =>
         seq(
            '-',
            field('name', $.identifier),
            optional('?'),
            ':',
            field('type', $._type_expression),
            repeat($.field_meta),
         ),

      field_meta: ($) => seq('+', field('key', $.meta_path), '=', field('value', $.meta_value)),

      meta_path: ($) => sep1($.identifier, '.'),

      error_declaration: ($) =>
         seq(
            'error',
            field('code', $.number),
            field('name', $.identifier),
            field('message', $.error_message),
            optional(seq('HTTP', field('http_status', $.number))),
         ),

      error_message: ($) => choice($.string, $.identifier),

      service_declaration: ($) => seq('service', field('name', $.identifier), repeat($._service_item)),

      _service_item: ($) => choice($.annotation_line, $.service_method),

      annotation_line: ($) => prec.left(0, repeat1($.annotation_clause)),

      annotation_clause: ($) =>
         choice(
            prec(1, seq('@', field('name', $.annotation_word_list), ':', field('value', $.annotation_value))),
            seq('@', field('tag', $.identifier)),
         ),

      annotation_value: ($) => choice($.string, $.dotted_annotation_path, $.annotation_value_words),

      annotation_value_words: ($) => prec.right(0, repeat1($.identifier)),

      annotation_word_list: ($) => prec.left(0, repeat1($.identifier)),

      dotted_annotation_path: ($) => prec(1, seq($.identifier, repeat1(seq('.', $.identifier)))),

      service_method: ($) =>
         seq(
            '-',
            choice(
               seq('proxy', field('name', $.method_name)),
               seq(
                  optional('stream'),
                  field('name', $.method_name),
                  field('parameters', $.parameter_list),
                  optional(seq('=>', field('returns', $.method_returns))),
                  optional(field('errors', $.method_errors_clause)),
               ),
            ),
         ),

      method_errors_clause: ($) => seq('errors', field('names', $.error_name_list)),

      error_name_list: ($) => seq($.identifier, repeat(seq('|', $.identifier))),

      method_name: ($) => $.identifier,

      method_returns: ($) => choice(seq('stream', field('stream_payload', $.tuple_type)), $.tuple_type),

      parameter_list: ($) =>
         seq(
            '(',
            choice(
               seq('stream', field('stream_parameters', $.parameter_list)),
               seq(optional(seq($.parameter, repeat(seq(choice(',', '|'), $.parameter))))),
            ),
            ')',
         ),

      parameter: ($) =>
         choice(
            seq(field('name', $.identifier), optional('?'), ':', field('type', $._type_expression)),
            field('type', $._type_expression),
         ),

      tuple_type: ($) => seq('(', optional(seq($.tuple_field, repeat(seq(choice(',', '|'), $.tuple_field)))), ')'),

      tuple_field: ($) =>
         choice(
            seq(field('name', $.identifier), optional('?'), ':', field('type', $._type_expression)),
            field('type', $._type_expression),
         ),

      _type_expression: ($) => choice($.union_type, $._type_term),

      union_type: ($) => prec.left(1, seq($._type_term, repeat1(seq('|', $._type_term)))),

      _type_term: ($) => choice($.map_type, $.array_type, $.identifier),

      map_type: ($) =>
         prec.right(2, seq('map', '<', field('key', $._type_expression), ',', field('value', $._type_expression), '>')),

      array_type: ($) => prec.right(1, seq('[', ']', field('element', $._type_expression))),

      identifier: (_$) => /[a-zA-Z_][a-zA-Z0-9_]*/,

      number: (_$) => /\d+/,

      string: (_$) => seq('"', optional(field('content', token.immediate(/[^"\\]*/))), '"'),

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
