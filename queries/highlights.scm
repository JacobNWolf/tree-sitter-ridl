; Tree-sitter syntax highlighting for RIDL (WebRPC).
; Capture names follow common editor conventions (Helix / Neovim / Zed).

(line_comment) @comment

(number) @number
(string) @string

; Anonymous keyword tokens from the grammar
[
  "enum"
  "struct"
  "service"
  "error"
  "HTTP"
  "stream"
  "map"
  "import"
  "type"
  "proxy"
  "errors"
] @keyword

[
  "("
  ")"
  "["
  "]"
  "<"
  ">"
  ","
  ":"
  "-"
  "+"
  "="
  "=>"
  "@"
  "|"
] @punctuation

("?") @operator

(dotted_meta_literal) @string
(meta_word) @string

(meta_declaration
  key: (identifier) @property)

(enum_declaration
  name: (identifier) @type)

(struct_declaration
  name: (identifier) @type)

(type_alias_declaration
  name: (identifier) @type
  type: (_) @type)

(service_declaration
  name: (identifier) @type)

(import_path
  (string) @string)

(import_path
  (import_path_raw) @string)

(import_member
  member: (_) @constant)

(enum_variant_value
  (number) @number)

(enum_variant_value
  (identifier) @constant)

(enum_variant_value
  (string) @string)

(enum_variant_value
  (dotted_meta_literal) @string)

(error_message
  (identifier) @string)

(method_errors_clause
  (error_name_list
    (identifier) @constant))

(error_declaration
  name: (identifier) @constant)

(enum_variant
  name: (identifier) @constant)

(struct_field
  name: (identifier) @property
  type: (_) @type)

(field_meta
  key: (meta_path (_) @property))

(map_type
  key: (_) @type
  value: (_) @type)

(array_type
  element: (_) @type)

(method_name
  (identifier) @function)

(parameter
  name: (identifier) @variable.parameter
  type: (_) @type)

(parameter
  (identifier) @type)

(tuple_field
  name: (identifier) @variable.parameter
  type: (_) @type)

(tuple_field
  (identifier) @type)

(annotation_clause
  tag: (identifier) @attribute)

(annotation_clause
  name: (annotation_word_list
    (identifier) @attribute))

(annotation_value
  (string) @string)

(annotation_value
  (dotted_annotation_path) @property)

(annotation_value_words
  (identifier) @attribute)
