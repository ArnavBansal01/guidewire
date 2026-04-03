type AuthAction = "login" | "register" | "profile-save";

export type AuthUiError = {
  title: string;
  message: string;
  hint?: string;
};

const isOffline = () =>
  typeof navigator !== "undefined" && navigator.onLine === false;

const getErrorCode = (error: unknown) => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : "";
  }
  return "";
};

export const getFriendlyAuthError = (
  error: unknown,
  action: AuthAction,
): AuthUiError => {
  const code = getErrorCode(error);

  if (isOffline() || code === "auth/network-request-failed") {
    return {
      title: "Network issue detected",
      message:
        "We could not reach the server. Please check your internet connection and try again.",
      hint: "If you are on mobile data, switching networks can help.",
    };
  }

  if (code === "auth/popup-closed-by-user") {
    return {
      title: "Sign-in window closed",
      message: "The Google sign-in popup was closed before completion.",
      hint: "Please click continue and complete sign-in in the popup.",
    };
  }

  if (code === "auth/popup-blocked") {
    return {
      title: "Popup was blocked",
      message: "Your browser blocked the Google sign-in window.",
      hint: "Allow popups for this site, then retry.",
    };
  }

  if (code === "auth/too-many-requests") {
    return {
      title: "Too many attempts",
      message:
        "For security reasons, requests are temporarily limited. Please wait a bit and try again.",
    };
  }

  if (code === "auth/user-disabled") {
    return {
      title: "Account unavailable",
      message: "This account is disabled. Please contact support for help.",
    };
  }

  if (
    code === "permission-denied" ||
    code === "unavailable" ||
    code === "deadline-exceeded"
  ) {
    return {
      title: "Service is temporarily busy",
      message:
        "We could not save your details right now. Please retry in a moment.",
      hint: "Your information is not lost. Just submit once again.",
    };
  }

  if (action === "login") {
    return {
      title: "Login failed",
      message: "We could not sign you in right now. Please try again.",
    };
  }

  if (action === "profile-save") {
    return {
      title: "Could not save profile",
      message:
        "Your account is connected, but profile setup did not complete. Please retry.",
    };
  }

  return {
    title: "Registration failed",
    message: "We could not complete registration right now. Please try again.",
  };
};
