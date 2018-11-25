import Vue from "vue";
import Vuex from "vuex";
import apiAxios from "./plugins/axios";

const LOADING_STATES = {
  NOT_INITIATED: 0,
  LOADING: 1,
  LOAD_SUCCESS: 2,
  LOAD_ERROR: 3
};

const getProjectProp = prop => state => {
  switch (state.currentProject.loadingState) {
    case LOADING_STATES.LOAD_SUCCESS:
      return state.currentProject.data[prop];
    case LOADING_STATES.LOADING:
      return "loading...";
    case LOADING_STATES.NOT_INITIATED:
      return "...";
    case LOADING_STATES.LOAD_ERROR:
    default:
      return ":(";
  }
};

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    languages: {
      ru: "Russian"
    },
    algorithms: {
      nb: "Naive Bayes"
    },
    currentProject: {
      loadingState: LOADING_STATES.NOT_INITIATED,
      documentsLoadingState: LOADING_STATES.NOT_INITIATED,
      data: {
        id: null,
        name: null,
        language: null,
        description: null,
        labels: null,
        documents: null
      }
    },
    notificationQueue: []
  },

  getters: {
    currentProjectNameDisplay: getProjectProp("name"),

    currentProjectDescriptionDisplay: getProjectProp("description"),

    currentProjectLanguageDisplay: state =>
      state.currentProject.loadingState === LOADING_STATES.LOAD_SUCCESS
        ? state.languages[state.currentProject.data.language]
        : getProjectProp("language")(state),

    currentProjectLabelsDisplay: state =>
      (state.currentProject.data.labels || []).map(
        ({ id, classname, display_name }) => ({
          value: id,
          text: display_name ? `${display_name} (${classname})` : classname
        })
      ),

    currentProjectLabels: state => state.currentProject.data.labels || [],

    currentProjectDocuments: state => state.currentProject.data.documents || [],

    isCurrentProjectLoading: state =>
      state.currentProject.loadingState === LOADING_STATES.LOADING,

    isCurrentProjectDocumentsLoading: state =>
      state.currentProject.documentsLoadingState === LOADING_STATES.LOADING,

    notificationQueueLength: state => state.notificationQueue.length,
    peekNotification: state => state.notificationQueue[0] || null
  },

  mutations: {
    setCurrentProject(
      { currentProject },
      { id, name, language, description, labels }
    ) {
      currentProject.data.id = id;
      currentProject.data.name = name;
      currentProject.data.language = language;
      currentProject.data.description = description;
      currentProject.data.labels = labels;

      currentProject.loadingState = LOADING_STATES.LOAD_SUCCESS;
    },

    unsetCurrentProject({ currentProject }) {
      currentProject.loadingState = LOADING_STATES.NOT_INITIATED;
      currentProject.documentsLoadingState = LOADING_STATES.NOT_INITIATED;
    },

    startLoadingCurrentProject({ currentProject }) {
      currentProject.loadingState = LOADING_STATES.LOADING;
      currentProject.documentsLoadingState = LOADING_STATES.LOADING;
    },

    failLoadingCurrentProject({ currentProject }) {
      currentProject.loadingState = LOADING_STATES.LOAD_ERROR;
      currentProject.documentsLoadingState = LOADING_STATES.LOAD_ERROR;
    },

    enqueueNotification: (state, notification) =>
      state.notificationQueue.push(notification),

    dequeueNotification: state => state.notificationQueue.shift(),

    addNewDocToCurrentProject({ currentProject }, newDoc) {
      currentProject.data.documents.push(newDoc);
    },

    setCurrentProjectDocuments({ currentProject }, documents) {
      currentProject.data.documents = documents;
      currentProject.documentsLoadingState = LOADING_STATES.LOAD_SUCCESS;
    },

    deleteDocFromCurrentProject(
      {
        currentProject: {
          data: { documents }
        }
      },
      docId
    ) {
      const idxOfDeleted = documents.findIndex(d => d.id === docId);
      documents.splice(idxOfDeleted, 1);
    },

    deleteLabelFromCurrentProject(
      {
        currentProject: {
          data: { labels }
        }
      },
      labelId
    ) {
      const idxOfDeleted = labels.findIndex(l => l.id === labelId);
      labels.splice(idxOfDeleted, 1);
    },

    addNewLabelToCurrentProject(
      {
        currentProject: {
          data: { labels }
        }
      },
      newLabel
    ) {
      labels.push(newLabel);
    },

    updateLabelInCurrentProject(
      {
        currentProject: {
          data: { labels }
        }
      },
      newLabel
    ) {
      const idxOfDeleted = labels.findIndex(l => l.id === newLabel.id);
      labels.splice(idxOfDeleted, 1, newLabel);
    },

    editDocInCurrentProject(
      {
        currentProject: {
          data: { documents }
        }
      },
      newDoc
    ) {
      const idxOfDeleted = documents.findIndex(l => l.id === newDoc.id);
      documents.splice(idxOfDeleted, 1, newDoc);
    },

    editCurrentProject(
      {
        currentProject: { data }
      },
      { name, description, language }
    ) {
      data.name = name;
      data.description = description;
      data.language = language;
    },

    setDocTextInCurrentProject(state, { doc, text }) {
      Vue.set(doc, "text", text);
    }
  },

  actions: {
    loadProject({ commit }, projectId) {
      commit("startLoadingCurrentProject");

      const projectPromise = apiAxios
        .get(`projects/${projectId}/`)
        .then(({ data: { name, language, description, labels } }) => {
          commit("setCurrentProject", {
            id: projectId,
            name,
            description,
            language,
            labels
          });
        });

      const documentsPromise = apiAxios
        .get(`projects/${projectId}/documents/`)
        .then(({ data }) => commit("setCurrentProjectDocuments", data));

      return Promise.all([projectPromise, documentsPromise]).catch(() => {
        commit("failLoadingCurrentProject");
        commit("enqueueNotification", {
          type: "error",
          text: `Couldn't load the project. Maybe, your internet connection is down? If not, please, contact the administator.`,
          timeout: 10000
        });
      });
    },

    unloadProject({ commit }) {
      return commit("unsetCurrentProject");
    },

    addNewDocToProject({ commit, state }, { title, text, label }) {
      if (
        state.currentProject.documentsLoadingState ===
        LOADING_STATES.LOAD_SUCCESS
      ) {
        return apiAxios
          .post(`projects/${state.currentProject.data.id}/documents/`, {
            title: title === undefined ? null : title,
            text,
            label_id: label === undefined ? null : label
          })
          .then(({ data }) => {
            commit("addNewDocToCurrentProject", data);

            commit("enqueueNotification", {
              type: "success",
              text: `A new document was added to ${
                state.currentProject.data.name
              }!`
            });

            return data;
          })
          .catch(() => {
            commit("enqueueNotification", {
              type: "error",
              text:
                "Could not add a new document to the current project. Not sure why :("
            });
            return Promise.reject();
          });
      } else {
        commit("enqueueNotification", {
          type: "error",
          text:
            "Cannot add a document to a not loaded project. Please, wait until it loads."
        });
        return Promise.reject();
      }
    },

    deleteDocumentFromProject({ commit }, docId) {
      return apiAxios
        .delete(`documents/${docId}/`)
        .then(() => {
          commit("deleteDocFromCurrentProject", docId);
          commit("enqueueNotification", {
            type: "success",
            text: "Document was deleted successfully!"
          });
        })
        .catch(() => {
          commit("enqueueNotification", {
            type: "error",
            text: "Oops, couldn't delete this document :("
          });
        });
    },

    deleteLabelFromProject({ commit }, labelId) {
      return apiAxios
        .delete(`labels/${labelId}/`)
        .then(() => {
          commit("deleteLabelFromCurrentProject", labelId);
          commit("enqueueNotification", {
            type: "success",
            text: "Label was deleted successfully!"
          });
        })
        .catch(() => {
          commit("enqueueNotification", {
            type: "error",
            text: "Oops, couldn't delete this label :("
          });
        });
    },

    addNewLabelToProject({ commit, state }, { classname, display_name }) {
      if (state.currentProject.loadingState === LOADING_STATES.LOAD_SUCCESS) {
        return apiAxios
          .post(`projects/${state.currentProject.data.id}/labels/`, {
            classname,
            display_name: display_name || ""
          })
          .then(({ data }) => {
            commit("addNewLabelToCurrentProject", data);

            commit("enqueueNotification", {
              type: "success",
              text: `A new label was added to ${
                state.currentProject.data.name
              }!`
            });

            return data;
          })
          .catch(() => {
            commit("enqueueNotification", {
              type: "error",
              text:
                "Could not add a new label to the current project. Not sure why :("
            });
            return Promise.reject();
          });
      } else {
        commit("enqueueNotification", {
          type: "error",
          text:
            "Cannot add a label to a not loaded project. Please, wait until it loads."
        });
        return Promise.reject();
      }
    },

    editLabelInProject({ commit }, { id, classname, display_name }) {
      return apiAxios
        .patch(`labels/${id}/`, {
          classname,
          display_name
        })
        .then(({ data }) => {
          commit("updateLabelInCurrentProject", data);

          commit("enqueueNotification", {
            type: "success",
            text: `Label ${data.classname} was updated!`
          });

          return data;
        })
        .catch(() => {
          commit("enqueueNotification", {
            type: "error",
            text: `Couldn't update label ${classname} :(
              Please try again. If the issue persists, contact administrator.`,

            timeout: 8000
          });
          return Promise.reject();
        });
    },

    editDocInProject({ commit }, { id, text, title, label }) {
      const is_set_manually = label !== null && label !== undefined;
      return apiAxios
        .patch(`documents/${id}/`, {
          text,
          title,
          label,
          is_set_manually
        })
        .then(({ data }) => {
          commit("editDocInCurrentProject", data);

          commit("enqueueNotification", {
            type: "success",
            text: `Document ${data.id} was updated!`
          });

          return data;
        })
        .catch(() => {
          commit("enqueueNotification", {
            type: "error",
            text: `Couldn't update the document :(
              Please try again. If the issue persists, contact administrator.`,

            timeout: 8000
          });
          return Promise.reject();
        });
    },

    editProject({ commit }, { id, name, description, language }) {
      return apiAxios
        .patch(`projects/${id}/`, {
          name,
          description,
          language
        })
        .then(({ data }) => {
          commit("editCurrentProject", data);
          commit("enqueueNotification", {
            type: "success",
            text: `Successfully edited "${data.name}"!`
          });
          return data;
        })
        .catch(() => {
          commit("enqueueNotification", {
            type: "error",
            text: `Couldn't save edit for "${name}" :(`
          });
          return Promise.reject();
        });
    },

    deleteProject({ commit, dispatch, state }) {
      const data = state.currentProject.data;

      return apiAxios
        .delete(`projects/${data.id}/`)
        .then(() => {
          dispatch("unloadProject");
          commit("enqueueNotification", {
            type: "success",
            text: `Project "${data.name}" was deleted. Sad to see you go :(`
          });
          return data;
        })
        .catch(() => {
          commit("enqueueNotification", {
            type: "error",
            text: `Couldn't delete project "${
              data.name
            }". Maybe, that's for the better? ;)`
          });
          return Promise.reject(data);
        });
    },

    getDocTextInProject: async ({ commit, state }, docId) => {
      if (
        state.currentProject.documentsLoadingState ===
        LOADING_STATES.LOAD_SUCCESS
      ) {
        const doc = state.currentProject.data.documents.find(
          d => d.id === docId
        );
        if (doc !== null) {
          if (doc.text !== null && doc.text !== undefined) {
            return doc.text;
          } else {
            return apiAxios.get(`documents/${docId}/`).then(({ data }) => {
              commit("setDocTextInCurrentProject", { doc, text: data.text });
              return doc.text;
            });
          }
        }
      }
      return Promise.reject("Couldn't load the text of this document");
    },

    importDocumentsToProject({ commit, state }, { documents, label }) {
      return apiAxios
        .post(`projects/${state.currentProject.data.id}/import_documents/`, {
          documents,
          label
        })
        .then(({ data }) => {
          data.forEach(doc => commit("addNewDocToCurrentProject", doc));
          commit("enqueueNotification", {
            type: "success",
            text: `${data.length} documents were imported to the project!`
          });
        })
        .catch(() => {
          commit("enqueueNotification", {
            type: "error",
            text: `Oops, couldn't import the documents :(`
          });
        });
    }
  }
});
