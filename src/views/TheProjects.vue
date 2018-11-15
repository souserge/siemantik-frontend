<template>
<v-layout column>
  <h2 class="mb-4">Your Projects</h2>
  
  <v-layout row wrap>
    <v-flex
      v-for="card in cards"
      xs4
      :key="card.name"
    >
      <v-card>
        <v-container fill-height fluid pa-2>
          <v-layout fill-height>
            <v-flex xs12 align-end flexbox>
              <h3 class="headline">{{ card.name }}</h3>
              <h4>language: {{ card.language }}</h4>
            </v-flex>
          </v-layout>
        </v-container>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn icon>
            <v-icon>favorite</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
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
</v-layout>
</template>

<script>
  export default {
    data: () => ({
      cards: []
    }),

    methods: {
      createNewProject() {
        
      }
    },

    mounted() {
      this.axios.get('projects/').then(({ data }) => {
        this.cards.push(...data)
      })
    }
  }
</script>