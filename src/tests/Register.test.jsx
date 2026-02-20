import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Register from "../pages/Register";
import { registerEmployee } from "../api/api";

vi.mock("../api/api");

test("register page loads", () => {
  render(<Register onBack={()=>{}} />);

  expect(screen.getByText(/create account/i))
    .toBeInTheDocument();
});
test("user can type into fields", () => {
  render(<Register onBack={()=>{}} />);

  const nameInput = screen.getByPlaceholderText("Full Name");

  fireEvent.change(nameInput, {
    target:{ value:"Aby Alex" }
  });

  expect(nameInput.value).toBe("Aby Alex");
});
test("submit sends correct data", async () => {

  registerEmployee.mockResolvedValue({});

  render(<Register onBack={()=>{}} />);

  fireEvent.change(screen.getByPlaceholderText("Full Name"),{
    target:{value:"Aby"}
  });

  fireEvent.change(screen.getByPlaceholderText("Username"),{
    target:{value:"aby123"}
  });

  fireEvent.change(screen.getByPlaceholderText("Password"),{
    target:{value:"pass"}
  });

  fireEvent.click(screen.getByRole("button",{name:/register/i}));

  await waitFor(() => {
    expect(registerEmployee).toHaveBeenCalled();
  });

});
test("shows validation errors", async () => {

  registerEmployee.mockRejectedValue({
    status:400,
    message: JSON.stringify({
      errors:{
        Name:["Name is required"]
      }
    })
  });

  render(<Register onBack={()=>{}} />);

  fireEvent.click(screen.getByRole("button",{name:/register/i}));

  expect(await screen.findByText(/name is required/i))
    .toBeInTheDocument();

});
test("shows username exists popup", async () => {

  registerEmployee.mockRejectedValue({ status:409 });

  render(<Register onBack={()=>{}} />);

  fireEvent.click(screen.getByRole("button",{name:/register/i}));

  expect(await screen.findByText(/username already exists/i))
    .toBeInTheDocument();

});
test("shows success modal after register", async () => {

  registerEmployee.mockResolvedValue({});

  render(<Register onBack={()=>{}} />);

  fireEvent.click(screen.getByRole("button",{name:/register/i}));

  expect(await screen.findByText(/registration success/i))
    .toBeInTheDocument();

});