import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";

const apiAxios = axios.create({
  baseURL: "http://localhost:8000/"
});

export default apiAxios;

Vue.use(VueAxios, apiAxios);
