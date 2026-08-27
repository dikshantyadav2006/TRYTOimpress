import { ApiError } from "./api";

export interface FriendlyError {
  message: string;
  retryable: boolean;
}

const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "Incorrect email or password.",
  email_and_password_required: "Enter your email and password.",
  invalid_registration:
    "Registration failed. Check your details (password must be at least 6 characters).",
  forbidden: "You don't have permission to do that.",
  unauthorized: "Your session expired. Please sign in again.",
  email_taken: "That email is already registered. Try signing in instead.",
  slug_taken: "That page address is already taken. Try another one.",
  invalid_slug: "That address isn't valid — use lowercase letters, numbers, and dashes.",
  password_too_short: "Password must be at least 6 characters.",
  wrong_password: "Your current password doesn't match. Try again.",
};

export function friendlyError(err: unknown): FriendlyError {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      message: "No internet connection. Check your connection and try again.",
      retryable: true,
    };
  }

  if (err instanceof ApiError) {
    const mapped = CODE_MESSAGES[err.message];
    if (mapped) return { message: mapped, retryable: false };

    if (err.status >= 500) {
      return {
        message: "Something went wrong on our side. Please try again in a few minutes.",
        retryable: true,
      };
    }
    if (err.status === 404) {
      return {
        message: "This page isn't available yet. Try again shortly.",
        retryable: true,
      };
    }
    if (err.status === 413) {
      return { message: "The file is too large to upload.", retryable: false };
    }
    return {
      message: err.message || "Something went wrong. Please try again.",
      retryable: false,
    };
  }

  if (err instanceof Error && err.name === "AbortError") {
    return {
      message: "Server is taking too long to respond. Please try again.",
      retryable: true,
    };
  }

  return {
    message: "Network error. Check your connection and try again.",
    retryable: true,
  };
}
