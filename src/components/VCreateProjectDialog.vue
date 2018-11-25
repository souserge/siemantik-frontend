
<template>
<v-dialog
  persistent
  v-model="dialog"
  max-width="500px"
>
  <v-card>
    <v-card-title>
      <span class="headline">
        Create a new Project
      </span>
    </v-card-title>

    <v-card-text>
          <v-form v-model="isFormValid" ref="form">
            <v-text-field
              v-model="name.value"
              :label="name.text"
              :rules="name.rules"
            ></v-text-field>
            <v-select
              v-model="language.value"
              :label="language.text"
              :items="language.options"
              :rules="language.rules"
            ></v-select>
            <v-textarea
              v-model="description.value"
              :label="description.text"
              :rows="10"
            ></v-textarea>
          </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
      <v-btn color="primary" dark @click="create">Create</v-btn>
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

  data() {
    return {
      isFormValid: false,
      name: {
        text: "Name",
        value: "",
        rules: [
          v => !!v || "Name must be specified",
          v => v.length < 101 || "Name is too long (max. 100 characters)"
        ]
      },
      language: {
        text: "Language",
        value: "ru",
        options: [
          {
            text: "Russian",
            value: "ru"
          }
        ]
      },
      description: {
        text: "Description",
        value: ""
      }
    };
  },

  methods: {
    create() {
      if (this.$refs.form.validate()) {
        this.$emit("create", {
          name: this.name.value,
          language: this.language.value,
          description: this.description.value
        });
      }
    },

    close() {
      this.$emit("cancel");
    }
  }
};
</script>
