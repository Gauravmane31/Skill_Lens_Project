import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI crash caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc",
            padding: "24px",
          }}
        >
          <div
            style={{
              maxWidth: "640px",
              width: "100%",
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
              color: "#1e293b",
            }}
          >
            <h2 style={{ margin: "0 0 10px", fontSize: "20px" }}>Something went wrong</h2>
            <p style={{ margin: "0 0 14px", color: "#475569", fontSize: "14px" }}>
              The app hit a runtime error after login. Please reload once. If it repeats,
              open browser DevTools and copy the first red error.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                border: "none",
                background: "#4f46e5",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reload app
            </button>
            {this.state.error?.message && (
              <pre
                style={{
                  marginTop: "14px",
                  background: "#f1f5f9",
                  borderRadius: "8px",
                  padding: "10px",
                  fontSize: "12px",
                  overflowX: "auto",
                  color: "#0f172a",
                }}
              >
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
