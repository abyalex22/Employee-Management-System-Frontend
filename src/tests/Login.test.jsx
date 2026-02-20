import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Login from "../pages/Login";
import { login } from "../api/api";

vi.mock("../api/api");

test("login success", async () => {

  login.mockResolvedValue({
    token:"123",
    status:"Active"
  });

  const fakeLogin = vi.fn();

  render(<Login onLogin={fakeLogin} onRegister={()=>{}} />);

  fireEvent.change(screen.getByPlaceholderText("Username"), {
    target:{ value:"admin" }
  });

  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target:{ value:"1234" }
  });

  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

  await waitFor(() => {
    expect(fakeLogin).toHaveBeenCalled();
  });

});
test("inactive user blocked", async () => {

  login.mockResolvedValue({
    status:"Inactive"
  });

  render(<Login onLogin={()=>{}} onRegister={()=>{}} />);

 fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

  expect(await screen.findByText(/access restricted/i))
    .toBeInTheDocument();
});
test("sends correct login payload", async () => {

  login.mockResolvedValue({ token:"123", status:"Active" });

  render(<Login onLogin={()=>{}} onRegister={()=>{}} />);

  fireEvent.change(screen.getByPlaceholderText("Username"), {
    target:{ value:"aby" }
  });

  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target:{ value:"secret" }
  });

  fireEvent.click(screen.getByRole("button",{name:/sign in/i}));

  await waitFor(() => {
    expect(login).toHaveBeenCalledWith({
      username:"aby",
      password:"secret"
    });
  });

});
test("shows error popup on login failure", async () => {

  login.mockRejectedValue(new Error("Invalid credentials"));

  render(<Login onLogin={()=>{}} onRegister={()=>{}} />);

  fireEvent.click(screen.getByRole("button",{name:/sign in/i}));

  expect(await screen.findByText(/login failed/i))
    .toBeInTheDocument();

});
test("clicking register triggers navigation", () => {

  const fakeNav = vi.fn();

  render(<Login onLogin={()=>{}} onRegister={fakeNav} />);

  fireEvent.click(screen.getByText(/register/i));

  expect(fakeNav).toHaveBeenCalled();

});