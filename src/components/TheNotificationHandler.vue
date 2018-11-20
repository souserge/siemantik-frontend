<template>
<div>
  <v-snackbar
    v-model="isVisible"
    :color="color"
    :timeout="timeout"
    :auto-height="true"
    bottom right
  >
    {{ text }}
    <v-btn
      dark
      flat
      @click="isVisible = false"
    >
      Close
    </v-btn>
  </v-snackbar>
</div>
</template>

<script>
export default {
  data: () => ({
    text: "",
    color: "",
    timeout: 0,
    isVisible: false,

    notificationTypes: ["info", "success", "error"]
  }),

  computed: {
    numNotifications() {
      return this.$store.getters.notificationQueueLength;
    },
    notification() {
      return this.$store.getters.peekNotification;
    }
  },

  methods: {
    takeNewNotification() {
      if (this.notification !== null) {
        const { text, type, timeout } = this.notification;
        this.text = text || "";
        this.color = this.notificationTypes.includes(type) ? type : "info";
        this.timeout = isNaN(timeout)
          ? 4000
          : Math.min(10000, Math.max(500, timeout));
        this.isVisible = true;
        this.$store.commit("dequeueNotification");
      }
    }
  },

  watch: {
    async isVisible() {
      if (!this.isVisible) {
        await this.$nextTick();
        setTimeout(() => {
          this.takeNewNotification();
        }, 500);
      }
    },
    numNotifications(value, oldValue) {
      if (!this.isVisible && oldValue === 0) {
        this.takeNewNotification();
      }
    }
  },

  mounted() {
    this.takeNewNotification();
  }
};
</script>