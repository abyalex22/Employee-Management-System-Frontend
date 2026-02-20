import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import { getEmployeeById, updateEmployee } from "../api/api";

vi.mock("../api/api");

test("loads employee profile", async () => {

  getEmployeeById.mockResolvedValue({
    employeeId:1,
    name:"Aby",
    status:"Active"
  });

  render(
    <EmployeeDashboard
      user={{employeeId:1, username:"aby"}}
      onLogout={()=>{}}
    />
  );

  expect(await screen.findByText("Aby"))
    .toBeInTheDocument();
});

test("shows inactive popup if user inactive", async () => {

  getEmployeeById.mockResolvedValue({
    employeeId:1,
    name:"Aby",
    status:"Inactive"
  });

  render(
    <EmployeeDashboard
      user={{employeeId:1}}
      onLogout={()=>{}}
    />
  );

  expect(await screen.findByText(/marked as inactive/i))
    .toBeInTheDocument();
});
test("edit button opens modal", async () => {

  getEmployeeById.mockResolvedValue({
    employeeId:1,
    name:"Aby",
    status:"Active"
  });

  render(
    <EmployeeDashboard
      user={{employeeId:1}}
      onLogout={()=>{}}
    />
  );

  const editBtn = await screen.findByRole("button",{name:/edit/i});
  fireEvent.click(editBtn);

  expect(screen.getByText(/edit profile/i))
    .toBeInTheDocument();
});
test("save calls update api", async () => {

  getEmployeeById.mockResolvedValue({
    employeeId:1,
    name:"Aby",
    status:"Active",
    role:"Employee"
  });

  updateEmployee.mockResolvedValue({});

  render(
    <EmployeeDashboard
      user={{employeeId:1, username:"aby"}}
      onLogout={()=>{}}
    />
  );

  fireEvent.click(await screen.findByRole("button",{name:/edit/i}));

  fireEvent.click(screen.getByRole("button",{name:/save changes/i}));

  await waitFor(()=>{
    expect(updateEmployee).toHaveBeenCalled();
  });

});

test("success popup appears after save", async () => {

  getEmployeeById.mockResolvedValue({
    employeeId:1,
    name:"Aby",
    status:"Active",
    role:"Employee"
  });

  updateEmployee.mockResolvedValue({});

  render(
    <EmployeeDashboard
      user={{employeeId:1, username:"aby"}}
      onLogout={()=>{}}
    />
  );

  fireEvent.click(await screen.findByRole("button",{name:/edit/i}));

  fireEvent.click(screen.getByRole("button",{name:/save changes/i}));

  expect(await screen.findByText(/details updated successfully/i))
    .toBeInTheDocument();
});