// Backend URL
export const BASE_LOCAL_URL = "http://localhost:5000/";
export const BASE_URL = "https://biologic-dev.unimelb.edu.au/";
//export const BASE_URL = "http://localhost:5000/";

// Default user id
export const DEFAULT_USER_ID = "Type your Student ID here";

// API End points
export const API_ENDPOINTS = {
  LOGIN_ENDPOINT: "verify-client",
  GET_QUESTIONS_LIST: "list-available-exnet",
  GET_EXNET: "get-exnet",
  STORE_WORKING_ANSWER: "store-working-answer",
  GET_LAST_WORKING_ANSWER: "get-last-working-answer",
  GET_FEEDBACK: "get-exnet-feedback",
};

// API common form data params
export const API_BODY_PARAMS = {
  CLIENT_ID_BODY_PARAM: "client_id",
  SECRET_KEY_BODY_PARAM: "persistent_secret_key",
  EXNET_NAME: "exnet_name",
};

// rubric status enum
export const RUBRIC_STATUS = {
  GC: "GRADE_CORRECT",
  GIC: "GRADE_INCORRECT",
  GPC: "GRADE_PARTIALLY_CORRECT",
  GNC: "GRADE_NOT_COMPLETE",
  MG: "MANUALLY_GRADED",
};

export const CLIENT_TYPE = {
  1: "Admin",
  2: "Academic",
  3: "Student",
};

export const STATEMENT_PROPORTION_REQUIRED = 50;