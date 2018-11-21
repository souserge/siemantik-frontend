<template>
<v-dialog
  persistent
  v-model="dialog"
  max-width="500px"
  @keydown.esc="cancel"
>
  <v-card>
    <v-card-title>
      <slot></slot>
    </v-card-title>

    <v-card-text>
      <slot name="additional-info"></slot>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        :color="reverseColors ? 'blue' : 'blue darken-1'"
        :flat="!reverseColors"
        :dark="reverseColors"
        @click="cancel"
      >
        <slot name="cancel">
          Cancel
        </slot>
      </v-btn>
      <v-btn
        :color="reverseColors ? 'darken-1' : 'error'"
        :flat="reverseColors"
        :dark="!reverseColors"
        @click="confirm"
      >
        <slot name="action">
          Confirm
        </slot>
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script>
export default {
  props: {
    dialog: {
      type: Boolean,
      default: false
    },
    reverseColors: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    confirm() {
      this.$emit("confirm");
    },

    cancel() {
      this.$emit("cancel");
    }
  }
};
</script>
