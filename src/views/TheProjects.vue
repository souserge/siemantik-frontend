<template>
<v-layout grid-list-md column>
  <h2 class="mb-4">Your Projects</h2>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex
        v-for="project in projects"
        xs4
        :key="project.name"
      >
        <router-link :to="{ name: 'project', params: { id: project.id }}">
          <v-card @click="openProject(project)">
            <v-container fill-height fluid pa-2>
              <v-layout fill-height>
                <v-flex xs12 align-end flexbox>
                  <h3 class="headline">{{ project.name }}</h3>
                  <h4>language: {{ project.language }}</h4>
                </v-flex>
              </v-layout>
            </v-container>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn >
                <v-icon>favorite</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </router-link>
      </v-flex>
      <v-flex xs4 align-center>
        <v-container fill-height>
          <v-layout row wrap align-center>
            <v-flex class="text-xs-center">
              <v-btn icon x-large @click="createNewProject">
                <v-icon x-large>add</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>  
    </v-layout>
  </v-container>
</v-layout>
</template>

<script>
  export default {
    data: () => ({
      projects: []
    }),

    methods: {
      createNewProject() {
        
      }
    },

    mounted() {
      this.axios.get('projects/').then(({ data }) => {
        this.projects.push(...data)
      })
    }
  }
</script>











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
            <v-text-field
              v-model="item[attr.value]"
              :label="attr.text"
              :rules="rules(attr)"
              :key="idx"
            ></v-text-field>
            <v-select
              v-model="item[attr.value]"
              :label="attr.text"
              :items="attr.options"
              :rules="rules(attr)"
              :key="idx"
            ></v-select>
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
export default {
  mixins: [checkAttributeTypeMixin],

  props: {
    dialog: {
      type: Boolean,
      default: false,
    },

    item: Object,
    attributes: Array,
  },

  data() {
    return {
      isFormValid: false,
    };
  },

  methods: {
    save() {
      if (this.$refs.form.validate()) {
        this.$emit('save');
      }
    },

    close() {
      this.$emit('cancel');
    },
  },
};
</script>
