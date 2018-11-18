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
      currentProject.data.labels = labels.map(
        ({ id, classname, display_name }) => ({
          value: id,
          text: display_name ? `${display_name} (${classname})` : classname
        })
      );

      currentProject.loadingState = LOADING_STATES.LOAD_SUCCESS;
    },

    unsetCurrentProject({ currentProject }) {
      currentProject.loadingState = LOADING_STATES.NOT_INITIATED;
    },

    loadCurrentProject({ currentProject }) {
      currentProject.loadingState = LOADING_STATES.LOADING;
    },

    failLoadingCurrentProject({ currentProject }) {
      currentProject.loadingState = LOADING_STATES.LOAD_ERROR;
    },

    enqueueNotification: (state, notification) =>
      state.notificationQueue.push(notification),
    dequeueNotification: state => state.notificationQueue.shift()
  },
  actions: {
    loadProject({ commit }, projectId) {
      commit("loadCurrentProject");

      return apiAxios
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
        )
        .catch(() => commit("failLoadingCurrentProject"));
    },

    unloadProject({ commit }) {
      return commit("unsetCurrentProject");
    }
  }
});
