const BASE_URL = "https://localhost:7272/api";


async function request(url, options = {}) {

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options,
  });

  if (!res.ok) {
  const text = await res.text();

  /* AUTO LOGOUT IF TOKEN INVALID */
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
  }

  throw {
    status: res.status,
    message: text || "Request failed",
  };
}


  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  return res.json();
}


export const login = (data) =>
  request("/v2/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const registerEmployee = (data) =>
  request("/v2/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });


export const getAllEmployees = (pageNumber = 1, pageSize = 5, search = "") =>
  request(`/v2/employees?page=${pageNumber}&pageSize=${pageSize}&search=${search}`);



export const getEmployeeById = (id) =>
  request(`/v2/employees/${id}`);

export const updateEmployee = (id, data) =>
  request(
    id === "self"
      ? "/v2/employees/self"
      : `/v2/employees/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );




/* PHOTO UPDATE */
export const updateEmployeePhoto = (id, base64) =>
  request(`/employees/${id}/photo`, {
    method: "PUT",
    body: JSON.stringify({ photo: base64 }),
  });
