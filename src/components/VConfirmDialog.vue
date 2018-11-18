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

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click="cancel">Cancel</v-btn>
      <v-btn color="error" dark @click="confirm">
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
