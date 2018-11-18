<template>
<v-dialog
  persistent
  v-model="dialog"
  max-width="500px"
  v-if="item"
  @keydown.esc="close"
  @keydown.enter="save"
>
  <v-card>
    <v-card-title>
      <span class="headline">
        <slot>Edit Item</slot>
      </span>
    </v-card-title>

    <v-card-text>
          <v-form v-model="isFormValid" ref="form">
            <template
              v-for="(attr, idx) in attributes"
            >
              <v-text-field
                v-if="isText(attr)"
                v-model="item[attr.value]"
                :label="attr.text"
                :rules="rules(attr)"
                :key="idx"
              ></v-text-field>
              <v-select
                v-else-if="isOptions(attr)"
                v-model="item[attr.value]"
                :label="attr.text"
                :items="attr.options"
                :rules="rules(attr)"
                :key="idx"
              ></v-select>
              <v-checkbox
                v-else-if="isCheckbox(attr)"
                v-model="item[attr.value]"
                :label="attr.text"
                :items="attr.options"
                :rules="rules(attr)"
                :key="idx"
              ></v-checkbox>
            </template>
          </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
      <v-btn color="primary" dark @click="save">Save</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script>
import checkAttributeTypeMixin from "@/mixins/checkAttributeTypeMixin";

export default {
  mixins: [checkAttributeTypeMixin],

  props: {
    dialog: {
      type: Boolean,
      default: false
    },

    item: {
      type: Object,
      default: () => ({})
    },
    attributes: Array
  },

  data() {
    return {
      isFormValid: false
    };
  },

  methods: {
    save() {
      if (this.$refs.form.validate()) {
        this.$emit("save", this.item);
      }
    },

    close() {
      this.$emit("cancel");
    },

    rules(attr) {
      return attr.rules;
    }
  }
};
</script>
