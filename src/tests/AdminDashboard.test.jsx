import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AdminDashboard from "../pages/AdminDashboard";
import { getAllEmployees, updateEmployee } from "../api/api";

vi.mock("../api/api");

const mockData = {
  data:[{
    employeeId:1,
    name:"Aby",
    status:"Active",
    role:"Employee"
  }],
  totalCount:1
};

test("loads employee list", async () => {
  getAllEmployees.mockResolvedValue(mockData);

  render(<AdminDashboard user={{username:"admin"}} onLogout={()=>{}} />);

  expect(await screen.findByText("Aby"))
    .toBeInTheDocument();
});

test("shows employee count", async () => {
  getAllEmployees.mockResolvedValue({...mockData,totalCount:7});

  render(<AdminDashboard user={{username:"admin"}} onLogout={()=>{}} />);

  expect(await screen.findByText("7"))
    .toBeInTheDocument();
});

// test("edit opens modal", async () => {
//   getAllEmployees.mockResolvedValue(mockData);

//   render(<AdminDashboard user={{username:"admin"}} onLogout={()=>{}} />);

//   const editIcon = await screen.findByRole("button",{hidden:true});
//   fireEvent.click(editIcon);

//   expect(await screen.findByText(/edit employee/i))
//     .toBeInTheDocument();
// });
test("edit opens modal", async () => {

  getAllEmployees.mockResolvedValue(mockData);

  render(<AdminDashboard user={{username:"admin"}} onLogout={()=>{}} />);

  const row = await screen.findByText("Aby");
  const editBtn = row.closest("tr").querySelector("button");

  fireEvent.click(editBtn);

  expect(await screen.findByText(/edit employee/i))
    .toBeInTheDocument();
});

// test("toggle status calls api", async () => {
//   getAllEmployees.mockResolvedValue(mockData);
//   updateEmployee.mockResolvedValue({});

//   render(<AdminDashboard user={{username:"admin"}} onLogout={()=>{}} />);

//   const toggleBtn = (await screen.findAllByRole("button"))[2];
//   fireEvent.click(toggleBtn);

//   await waitFor(()=>{
//     expect(updateEmployee).toHaveBeenCalled();
//   });
// });
test("toggle status calls api", async () => {

  getAllEmployees.mockResolvedValue(mockData);
  updateEmployee.mockResolvedValue({});

  render(<AdminDashboard user={{username:"admin"}} onLogout={()=>{}} />);

  const row = await screen.findByText("Aby");
  const buttons = row.closest("tr").querySelectorAll("button");

  const toggleBtn = buttons[1];
  fireEvent.click(toggleBtn);

  await waitFor(()=>{
    expect(updateEmployee).toHaveBeenCalledTimes(1);
  });
});

// test("save changes calls update api", async () => {
//   getAllEmployees.mockResolvedValue(mockData);
//   updateEmployee.mockResolvedValue({});

//   render(<AdminDashboard user={{username:"admin"}} onLogout={()=>{}} />);

//   const editIcon = await screen.findByRole("button",{hidden:true});
//   fireEvent.click(editIcon);

//   fireEvent.click(await screen.findByText(/save changes/i));

//   await waitFor(()=>{
//     expect(updateEmployee).toHaveBeenCalled();
//   });
// });
test("save changes calls update api", async () => {

  getAllEmployees.mockResolvedValue(mockData);
  updateEmployee.mockResolvedValue({});

  render(<AdminDashboard user={{username:"admin"}} onLogout={()=>{}} />);

  const row = await screen.findByText("Aby");
  const editBtn = row.closest("tr").querySelector("button");

  fireEvent.click(editBtn);

  fireEvent.click(await screen.findByText(/save changes/i));

  await waitFor(()=>{
    expect(updateEmployee).toHaveBeenCalled();
  });
});

test("pagination next loads page 2", async () => {
  getAllEmployees.mockResolvedValue({
    data: mockData.data,
    totalCount:10
  });

  render(<AdminDashboard user={{username:"admin"}} onLogout={()=>{}} />);

  fireEvent.click(await screen.findByText(/next/i));

  await waitFor(()=>{
    expect(getAllEmployees).toHaveBeenLastCalledWith(2,5,"");
  });
});