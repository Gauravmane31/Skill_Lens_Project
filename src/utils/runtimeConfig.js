export const getBackendBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_BACKEND_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return import.meta.env.DEV ? "http://localhost:5000" : "";
};
