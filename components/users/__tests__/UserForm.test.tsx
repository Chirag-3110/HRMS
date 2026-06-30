import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { UserForm } from "../UserForm";
import type { CreateUserFormData, UpdateUserFormData } from "@/lib/schemas/user";

describe("UserForm Component", () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Mode", () => {
    it("should render all form fields in create mode", () => {
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create user/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
    });

    it("should have empty form fields initially", () => {
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const fullNameInput = screen.getByLabelText(/full name/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/^password/i);

      expect(emailInput).toHaveValue("");
      expect(fullNameInput).toHaveValue("");
      expect(phoneInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
    });

    it("should display validation errors for required fields when submitted empty", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const submitButton = screen.getByRole("button", { name: /create user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
        expect(
          screen.getByText(/name must be at least 2 characters/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/password must be at least 8 characters/i)
        ).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should display validation error for invalid email format", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, "invalidemail");
      await user.tab(); // Trigger blur event

      await waitFor(() => {
        expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
      });
    });

    it("should display validation error for name that is too short", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, "A");
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/name must be at least 2 characters/i)
        ).toBeInTheDocument();
      });
    });

    it("should display validation error for invalid phone number format", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, "abc123xyz");
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid phone number/i)).toBeInTheDocument();
      });
    });

    it("should submit valid form data in create mode", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill in form fields
      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/full name/i), "John Doe");
      await user.type(
        screen.getByLabelText(/phone number/i),
        "+1 (555) 123-4567"
      );
      await user.type(
        screen.getByLabelText(/^password/i),
        "password123"
      );

      // Select role
      const roleSelect = screen.getByRole("combobox", { name: /role/i });
      await user.click(roleSelect);
      const memberOption = await screen.findByRole("option", { name: /member/i });
      await user.click(memberOption);

      // Submit form
      const submitButton = screen.getByRole("button", { name: /create user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: "test@example.com",
          fullName: "John Doe",
          phoneNumber: "+1 (555) 123-4567",
          role: "Member",
          password: "password123",
        } as CreateUserFormData);
      });
    });

    it("should submit form without phone number (optional field)", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      await user.type(
        screen.getByLabelText(/email address/i),
        "test@example.com"
      );
      await user.type(screen.getByLabelText(/full name/i), "Jane Smith");
      await user.type(
        screen.getByLabelText(/^password/i),
        "password123"
      );

      const roleSelect = screen.getByRole("combobox", { name: /role/i });
      await user.click(roleSelect);
      const adminOption = await screen.findByRole("option", { name: /admin/i });
      await user.click(adminOption);

      const submitButton = screen.getByRole("button", { name: /create user/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: "test@example.com",
          fullName: "Jane Smith",
          phoneNumber: "",
          role: "Admin",
          password: "password123",
        } as CreateUserFormData);
      });
    });
  });

  describe("Edit Mode", () => {
    const initialData: UpdateUserFormData = {
      email: "existing@example.com",
      fullName: "Existing User",
      phoneNumber: "+1 (555) 999-8888",
      role: "Member",
    };

    it("should pre-populate form fields with initial data in edit mode", () => {
      render(
        <UserForm
          mode="edit"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const fullNameInput = screen.getByLabelText(/full name/i);
      const phoneInput = screen.getByLabelText(/phone number/i);

      expect(emailInput).toHaveValue("existing@example.com");
      expect(fullNameInput).toHaveValue("Existing User");
      expect(phoneInput).toHaveValue("+1 (555) 999-8888");
    });

    it("should display Save Changes button in edit mode", () => {
      render(
        <UserForm
          mode="edit"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByRole("button", { name: /save changes/i })
      ).toBeInTheDocument();
    });

    it("should submit updated form data in edit mode", async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);

      render(
        <UserForm
          mode="edit"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Update the full name
      const fullNameInput = screen.getByLabelText(/full name/i);
      await user.clear(fullNameInput);
      await user.type(fullNameInput, "Updated User Name");

      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: "Updated User Name",
          })
        );
      });
    });
  });

  describe("Loading State", () => {
    it("should disable all inputs and buttons during loading", () => {
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      expect(screen.getByLabelText(/full name/i)).toBeDisabled();
      expect(screen.getByLabelText(/phone number/i)).toBeDisabled();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();
    });

    it("should display loading text in create mode", () => {
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    });

    it("should display loading text in edit mode", () => {
      render(
        <UserForm
          mode="edit"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isLoading={true}
        />
      );

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });
  });

  describe("Cancel Functionality", () => {
    it("should call onCancel when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for required fields", () => {
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const fullNameInput = screen.getByLabelText(/full name/i);
      const roleSelect = screen.getByLabelText(/role/i);

      expect(emailInput).toHaveAttribute("aria-invalid", "false");
      expect(fullNameInput).toHaveAttribute("aria-invalid", "false");
      expect(roleSelect).toHaveAttribute("aria-invalid", "false");
    });

    it("should set aria-invalid to true when field has error", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, "invalid");
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-invalid", "true");
      });
    });

    it("should associate error messages with inputs using aria-describedby", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, "invalid");
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
        expect(screen.getByText(/invalid email address/i)).toHaveAttribute(
          "id",
          "email-error"
        );
      });
    });
  });

  describe("Role Descriptions", () => {
    it("should display placeholder text when no role is selected", () => {
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByText(/select a role to see its permissions and access level/i)
      ).toBeInTheDocument();
    });

    it("should display Admin role description when Admin is selected", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const roleSelect = screen.getByRole("combobox", { name: /role/i });
      await user.click(roleSelect);
      const adminOption = await screen.findByRole("option", { name: /admin/i });
      await user.click(adminOption);

      await waitFor(() => {
        expect(
          screen.getByText(/full access to all platform features/i)
        ).toBeInTheDocument();
      });
    });

    it("should display Member role description when Member is selected", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const roleSelect = screen.getByRole("combobox", { name: /role/i });
      await user.click(roleSelect);
      const memberOption = await screen.findByRole("option", { name: /member/i });
      await user.click(memberOption);

      await waitFor(() => {
        expect(
          screen.getByText(/standard access with permissions to create and manage their own content/i)
        ).toBeInTheDocument();
      });
    });

    it("should display Guest role description when Guest is selected", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const roleSelect = screen.getByRole("combobox", { name: /role/i });
      await user.click(roleSelect);
      const guestOption = await screen.findByRole("option", { name: /guest/i });
      await user.click(guestOption);

      await waitFor(() => {
        expect(
          screen.getByText(/limited read-only access to view content without modification rights/i)
        ).toBeInTheDocument();
      });
    });

    it("should update description when role selection changes", async () => {
      const user = userEvent.setup();
      render(
        <UserForm
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Select Admin
      const roleSelect = screen.getByRole("combobox", { name: /role/i });
      await user.click(roleSelect);
      const adminOption = await screen.findByRole("option", { name: /admin/i });
      await user.click(adminOption);

      await waitFor(() => {
        expect(
          screen.getByText(/full access to all platform features/i)
        ).toBeInTheDocument();
      });

      // Change to Member
      await user.click(roleSelect);
      const memberOption = await screen.findByRole("option", { name: /member/i });
      await user.click(memberOption);

      await waitFor(() => {
        expect(
          screen.getByText(/standard access with permissions to create and manage their own content/i)
        ).toBeInTheDocument();
        expect(
          screen.queryByText(/full access to all platform features/i)
        ).not.toBeInTheDocument();
      });
    });

    it("should display role description in edit mode with pre-selected role", () => {
      const initialData: UpdateUserFormData = {
        email: "test@example.com",
        fullName: "Test User",
        role: "Guest",
      };

      render(
        <UserForm
          mode="edit"
          initialData={initialData}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByText(/limited read-only access to view content without modification rights/i)
      ).toBeInTheDocument();
    });
  });
});
