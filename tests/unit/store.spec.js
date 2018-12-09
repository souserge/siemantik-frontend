import { createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import * as R from "ramda";
import { storeConfig } from "@/store";

describe("TheNotificationHandler.vue", () => {
  let store;
  let localVue;

  beforeEach(() => {
    localVue = createLocalVue();
    store = new Vuex.Store(R.clone(storeConfig));
    localVue.use(Vuex);
  });

  it("sets a project if passed", () => {
    store.commit("setCurrentProject", { name: "foobar" });
    expect(store.getters.currentProjectNameDisplay).toEqual("foobar");
  });

  it("changes the label of a doc if exists", () => {
    store.commit("setCurrentProject", { name: "foobar" });
    store.commit("setCurrentProjectDocuments", [
      { id: 2, title: "foo", label: 3 },
      { id: 1, title: "bar", label: 1 }
    ]);
    expect(store.getters.currentProjectDocuments.length).toEqual(2);
    store.commit("setLabelsForDocsInCurrentProject", [
      { id: 1, label: 2 },
      { id: 2, label: 14 }
    ]);

    expect(
      R.propEq(
        "label",
        2,
        R.find(R.propEq("id", 1), store.getters.currentProjectDocuments)
      )
    ).toEqual(true);

    expect(
      R.propEq(
        "label",
        14,
        R.find(R.propEq("id", 2), store.getters.currentProjectDocuments)
      )
    ).toEqual(true);
  });
});
