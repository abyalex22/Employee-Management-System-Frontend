const BASE_URL = "https://localhost:7272/api";

async function request(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  
//   if (!res.ok) {
//   const text = await res.text();
//   throw {
//     status: res.status,
//     message: text || "Request failed",
//   };
    if (!res.ok) {
    let errorData = null;

    try {
      errorData = await res.json(); // for 400 validation errors
    } catch {
      errorData = await res.text();
    }

    throw {
      status: res.status,
      data: errorData,
    };


}


  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  return res.json();
}


export const login = (data) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const registerEmployee = (data) =>
  request("/employees/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getAllEmployees = (pageNumber = 1, pageSize = 5, search = "") =>
  request(
    `/employees?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`
  );

export const getEmployeeById = (id) =>
  request(`/employees/${id}`);

export const updateEmployee = (id, data) =>
  request(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

/* PHOTO UPDATE */
export const updateEmployeePhoto = (id, base64) =>
  request(`/employees/${id}/photo`, {
    method: "PUT",
    body: JSON.stringify({ photo: base64 }),
  });
