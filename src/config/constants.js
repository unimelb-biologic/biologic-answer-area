
// Backend URL
export const BASE_URL = 'http://localhost:5000/'

// API End points
export const API_ENDPOINTS = {
    LOGIN_ENDPOINT: 'verify-client',
    GET_QUESTIONS_LIST: 'list-available-exnet',
    GET_EXNET: 'get-exnet',
    STORE_WORKING_ANSWER: 'store-working-answer',
    GET_FEEDBACK :'get-exnet-feedback'
  }

// API common form data params
export const API_BODY_PARAMS = {
  CLIENT_ID_BODY_PARAM: 'client_id',
  SECRET_KEY_BODY_PARAM: 'persistent_secret_key',
  EXNET_NAME: 'exnet_name'
}