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
    classifiers: {
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
        classifier: null,
        labels: null,
        documents: null
      }
    },
    notificationQueue: []
  },

  getters: {
    currentProjectName: getProjectProp("name"),
    currentProjectDescription: getProjectProp("description"),
    currentProjectClassifier: getProjectProp("classifier"),
    currentProjectLabels: state => state.currentProject.data.labels || [],
    currentProjectLanguage: state =>
      state.currentProject.loadingState === LOADING_STATES.LOAD_SUCCESS
        ? state.languages[state.currentProject.data.language]
        : getProjectProp("language")(state),

    notificationQueueLength: state => state.notificationQueue.length,
    peekNotification: state => state.notificationQueue[0] || null
  },

  mutations: {
    setCurrentProject(
      { currentProject },
      { id, name, language, classifier, description, labels }
    ) {
      currentProject.data.id = id;
      currentProject.data.name = name;
      currentProject.data.language = language;
      currentProject.data.classifier = classifier;
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
      currentProject.data.push(newDoc);
    },

    setCurrentProjectDocuments({ currentProject }, documents) {
      currentProject.data.documents = documents;
      currentProject.documentsLoadingState = LOADING_STATES.LOAD_SUCCESS;
    }
  },
  actions: {
    loadProject({ commit }, projectId) {
      commit("startLoadingCurrentProject");

      const projectPromise = apiAxios
        .get(`projects/${projectId}/`)
        .then(
          ({ data: { name, language, classifier, description, labels } }) => {
            commit("setCurrentProject", {
              id: projectId,
              name,
              description,
              language,
              classifier,
              labels
            });
          }
        );

      const documentsPromise = apiAxios
        .get(`projects/${projectId}/documents/`)
        .then(({ data }) => commit("setCurrentProjectDocuments", data));

      return Promise.all(projectPromise, documentsPromise).catch(() =>
        commit("failLoadingCurrentProject")
      );
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
            title,
            text,
            label: label === undefined ? null : label
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
    }
  }
});
