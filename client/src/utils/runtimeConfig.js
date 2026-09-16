export const getBackendBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return "http://localhost:5000";
  }

  console.error(
    "VITE_BACKEND_URL is not set. All API requests (login, signup, everything) " +
    "will silently fail in this production build. Set VITE_BACKEND_URL in " +
    "client/.env to your deployed backend's URL before building.",
  );
  return "";
};
