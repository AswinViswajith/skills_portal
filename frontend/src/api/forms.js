import axiosInstance from "../config/axios";


export const formHub = async () => {
  try {
    const response = await axiosInstance.get("/forms/formhub");
    return response.data;
  } catch (error) {
    console.error("Error fetching form hub:", error);
    throw error;
  }
};

export const createFormInfo = async (form) => {
  try {
    const response = await axiosInstance.post("/forms", form);
    return response.data;
  } catch (error) {
    console.error("Error creating form:", error);
    throw error;
  }
};

export const createForm = async (form) => {
  try {
    const response = await axiosInstance.post("/forms", form);
    return response.data;
  } catch (error) {
    console.error("Error creating form:", error);
    throw error;
  }
};

export const getForms = async () => {
  try {
    const response = await axiosInstance.get("/forms");
    return response.data;
  } catch (error) {
    console.error("Error fetching forms:", error);
    throw error;
  }
};

export const getFormById = async (id) => {
  try {
    const response = await axiosInstance.get(`/forms/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching form by ID:", error);
    throw error;
  }
};

export const updateForm = async (id, updatedForm) => {
  try {
    const response = await axiosInstance.put(`/forms/${id}`, updatedForm);
    return response.data;
  } catch (error) {
    console.error("Error updating form:", error);
    throw error;
  }
};

export const deleteForm = async (id) => {
  try {
    const response = await axiosInstance.delete(`/forms/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting form:", error);
    throw error;
  }
};

export const createSection = async (formId, sections) => {
  try {
    const response = await axiosInstance.post(`/forms/edit`, { sections, formId });
    return response.data;
  } catch (error) {
    console.error("Error creating section:", error);
    throw error;
  }
};

export const sendForApproval = async (formId) => {
  try {
    const response = await axiosInstance.put(`/forms/sendForApproval/${formId}`);
    return response.data;
  } catch (error) {
    console.error("Error sending form for approval:", error);
    throw error;
  }
};

export const getAdminRequests = async () => {
  try {
    const response = await axiosInstance.get("/forms/admin/requests");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin requests:", error);
    throw error;
  }
};

export const approveOrRejectRequest = async (requestId, status, reason) => {
  try {
    const response = await axiosInstance.put(`/forms/admin/requests/${requestId}`, {
      reason,
      status
    });
    return response.data;
  } catch (error) {
    console.error("Error approving or rejecting request:", error);
    throw error;
  }
};


export const makeActiveOrInactive = async (formId, isActive) => {
  try {
    const response = await axiosInstance.put(`/forms/act/${formId}`, { isActive });
    return response;
  } catch (error) {
    console.error("Error making form active or inactive:", error);
    throw error;
  }
  }

export const getFormMetaData = async (formId) => {
  try {
    const department = await axiosInstance.get(`/master/departments`);
    const category = await axiosInstance.get(`/master/category`);
    return {
      department: department.data,
      category: category.data,
    };
  } catch (error) {
    console.error("Error fetching form metadata:", error);
    throw error;
  }
};
