export default {
  methods: {
    type(attr) {
      if (!!attr.type && typeof attr.type === "string") {
        return attr.type.trim().toLowerCase();
      }
      return "text";
    },

    isText(attr) {
      return this.type(attr) === "text";
    },

    isTextarea(attr) {
      return this.type(attr) === "textarea";
    },

    isOptions(attr) {
      // attr.options must be [{ text: String, value: any }]
      return (
        this.type(attr) === "options" &&
        attr.options &&
        Array.isArray(attr.options)
      );
    },

    isCheckbox(attr) {
      return this.type(attr) === "checkbox";
    },

    isList(attr) {
      return this.type(attr) === "list";
    }
  }
};
