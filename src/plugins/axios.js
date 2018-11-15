import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
 

const apiAxios = axios.create({
  baseURL: 'http://localhost:8000/',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'access-control-allow-headers'
	},
})


Vue.use(VueAxios, apiAxios)