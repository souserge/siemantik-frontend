<template>
<v-dialog
  persistent
  v-model="dialog"
  max-width="700px"
  @keydown.esc="cancel"
>
  <v-card>
    <v-card-title>
      <span class="headline">
        Import data
      </span>
    </v-card-title>

    <v-card-text>
      <v-form>
        <v-select
          v-model="label"
          :items="labels"
          persistent-hint
          hint="Imported documents will have this label automatically assigned"
          label="Select label"
          class="mb-4"
        ></v-select>
        <!--UPLOAD-->
        <form enctype="multipart/form-data" novalidate>
          <div class="dropbox">
            <input
              type="file"
              multiple
              @change="readFiles($event.target.name, $event.target.files)"
              name="Select documents"
              style="display: none"
              ref="uploadInput"
            >
          </div>
          <v-btn
            @click="selectFiles"
            :loading="state === STATES.SELECTING"
            :disabled="state > STATES.SELECTING"
          >
            Select Documents...
          </v-btn>
        </form>
        <v-btn @click="reselectDocs" small flat v-if="state === STATES.SELECTED">
          <span style="opacity: 0.6;text-transform:capitalize">Reselect</span>
        </v-btn>
      </v-form>
      <v-progress-linear v-if="importProgress > 0" v-model="importProgressPercentage"></v-progress-linear>
      <span v-if="state === STATES.SELECTED"><b>{{ numImportedDocs }}</b> {{ numImportedDocs > 1 ? 'documents were' : 'document was' }} selected! Click "Upload" to save changes.</span>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue darken-1" flat @click="cancel">Cancel</v-btn>
      <v-btn color="primary" :disabled="state < STATES.SELECTED" @click="uploadDocuments">
        Upload
        <!-- <v-icon right>cloud_upload</v-icon> -->
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
</template>

<script>
const processFileName = n => n.split(".")[0].trim();

const STATES = {
  NOT_STARTED: 0,
  SELECTING: 1,
  SELECTED: 2
};

function fileToText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = r =>
      resolve({
        title: processFileName(file.name),
        text: r.target.result
      });

    reader.onerror = reject;
    reader.readAsText(file);
  });
}

function filesToTexts(files) {
  return Array.from(files).map(fileToText);
}

export default {
  props: {
    dialog: {
      type: Boolean,
      default: false
    },

    labels: {
      type: Array
    },
    initLabel: {
      type: Number,
      default: -1
    }
  },

  data() {
    return {
      state: STATES.NOT_STARTED,
      importProgress: 0,
      numImportedDocs: -1,
      label: this.initLabel,
      STATES,
      documents: []
    };
  },

  computed: {
    importProgressPercentage() {
      return (this.importProgress / this.numImportedDocs) * 100;
    }
  },

  methods: {
    resetImport() {
      this.label = this.initLabel;
      this.reselectDocs();
    },

    reselectDocs() {
      this.state = STATES.NOT_STARTED;
      this.importProgress = 0;
      this.numImportedDocs = 0;
      this.documents = [];
    },

    cancel() {
      this.resetImport();
      this.$emit("cancel");
    },

    selectFiles() {
      this.$refs.uploadInput.click();
    },

    readFiles(name, files) {
      if (files.length === 0) {
        return;
      }

      this.state = STATES.SELECTING;
      this.numImportedDocs = files.length;
      Promise.all(
        filesToTexts(files).map(f =>
          f.then(t => {
            this.importProgress += 1;
            return t;
          })
        )
      ).then(data => {
        this.state = STATES.SELECTED;
        this.documents = data;
      });
    },

    uploadDocuments() {
      this.$emit("upload", this.documents, this.label);
      this.resetImport();
    }
  }
};
</script>

<style>
</style>
