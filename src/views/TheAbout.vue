<template>
  <v-layout class="mt-3" column>
    <v-card style="border-radius: 5px">
      <v-card-title
        class="headline"
      >compile(source, filename, mode, flags=0, dont_inherit=False, optimize=-1)</v-card-title>
      <v-card-text>
        Compile the source into a code or AST object. Code objects can be executed by exec() or eval(). source can either be a normal string, a byte string, or an AST object. Refer to the ast module documentation for information on how to work with AST objects.
        The filename argument should give the file from which the code was read; pass some recognizable value if it wasn’t read from a file ('string' is commonly used).
        The mode argument specifies what kind of code must be compiled; it can be 'exec' if source consists of a sequence of statements, 'eval' if it consists of a single expression, or 'single' if it consists of a single interactive statement (in the latter case, expression statements that evaluate to something other than None will be printed).
        The optional arguments flags and dont_inherit control which future statements affect the compilation of source. If neither is present (or both are zero) the code is compiled with those future statements that are in effect in the code that is calling compile(). If the flags argument is given and dont_inherit is not (or is zero) then the future statements specified by the flags argument are used in addition to those that would be used anyway. If dont_inherit is a non-zero integer then the flags argument is it – the future statements in effect around the call to compile are ignored.
        Future statements are specified by bits which can be bitwise ORed together to specify multiple statements. The bitfield required to specify a given feature can be found as the compiler_flag attribute on the _Feature instance in the __future__ module.
        The argument optimize specifies the optimization level of the compiler; the default value of -1 selects the optimization level of the interpreter as given by -O options. Explicit levels are 0 (no optimization; __debug__ is true), 1 (asserts are removed, __debug__ is false) or 2 (docstrings are removed too).
        This function raises SyntaxError if the compiled source is invalid, and ValueError if the source contains null bytes.
        If you want to parse Python code into its AST representation, see ast.parse().
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script>
export default {

}
</script>

<style>

</style>
