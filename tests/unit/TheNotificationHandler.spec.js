import { shallowMount, createLocalVue } from "@vue/test-utils";
import Vuex from "vuex";
import TheNotificationHandler from "@/components/TheNotificationHandler";
const localVue = createLocalVue();

localVue.use(Vuex);

describe("TheNotificationHandler.vue", () => {
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      state: {
        notificationQueue: []
      },
      getters: {
        notificationQueueLength: state => state.notificationQueue.length,
        peekNotification: state => state.notificationQueue[0] || null
      },
      mutations: {
        enqueueNotification: (state, notification) =>
          state.notificationQueue.push(notification),

        dequeueNotification: state => state.notificationQueue.shift()
      }
    });
  });

  it("dequeues a notification if there is one in the queue", () => {
    const wrapper = shallowMount(TheNotificationHandler, { store, localVue });
    store.commit("enqueueNotification", {
      text: "Hello"
    });
    expect(wrapper.text().indexOf("Hello")).not.toEqual(-1);
  });

  it("dequeues only the first notification if there is more than one in the queue", () => {
    const wrapper = shallowMount(TheNotificationHandler, { store, localVue });
    store.commit("enqueueNotification", {
      text: "Hello"
    });
    const otherMsgs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    otherMsgs.forEach(num =>
      store.commit("enqueueNotification", { text: num })
    );
    const output = wrapper.text();
    expect(output.indexOf("Hello")).not.toEqual(-1);
    otherMsgs.forEach(num => expect(output.indexOf(num)).toEqual(-1));
  });
});
