import commonApi from "./commonApi";

const base_url = `http://localhost:3000`;

export const userReg = async (data) => {
  return await commonApi(`${base_url}/reg`, "POST", "", data);
};

export const userLog = async (data) => {
  return await commonApi(`${base_url}/log`, "POST", "", data);
};

export const createBoard = async (data, headers) => {
  return await commonApi(`${base_url}/createBoard`, "POST", headers, data);
};

export const getAllBoards = async (headers) => {
  return await commonApi(`${base_url}/getAllBoards`, "GET", headers, "");
};

export const getBoardById = async (id, headers) => {
  return await commonApi(`${base_url}/getBoard/${id}`, "GET", headers, "");
};

export const updateBoard = async (id, data, headers) => {
  return await commonApi(`${base_url}/updateBoard/${id}`, "PUT", headers, data);
};

export const deleteBoard = async (id, headers) => {
  return await commonApi(`${base_url}/deleteBoard/${id}`, "DELETE", headers, "");
};

export const createColumn = async (data, headers) => {
  return await commonApi(`${base_url}/createColumn`, "POST", headers, data);
};

export const getColumnsByBoard = async (boardId, headers) => {
  return await commonApi(`${base_url}/columns/${boardId}`, "GET", headers, "");
};

export const updateColumn = async (id, data, headers) => {
  return await commonApi(`${base_url}/updateColumn/${id}`, "PUT", headers, data);
};

export const deleteColumn = async (id, headers) => {
  return await commonApi(`${base_url}/deleteColumn/${id}`, "DELETE", headers, "");
};



export const createTask = async (data, headers) => {
  return await commonApi(`${base_url}/createTask`, "POST", headers, data);
};

export const getTasksByColumn = async (columnId, headers) => {
  return await commonApi(`${base_url}/tasks/${columnId}`, "GET", headers, "");
};

export const updateTask = async (id, data, headers) => {
  return await commonApi(`${base_url}/updateTask/${id}`, "PUT", headers, data);
};

export const deleteTask = async (id, headers) => {
  return await commonApi(`${base_url}/deleteTask/${id}`, "DELETE", headers, "");
};

export const reorderTasks = async (data, headers) => {
  return await commonApi(`${base_url}/tasks-reorder`, "PATCH", headers, data);
};

