import React, { useState } from "react";
import { C } from "../constants/constants.js";
import useBreakpoint from "../hooks/useBreakpoint.js";
import { inputSt } from "../components/common/Atoms.jsx";
import { confirmPasswordReset } from "../services/api.js";

function ResetPasswordScreen({ onDone }) {
  const { isMobile } = useBreakpoint();
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPw) { setError("Passwords don't match."); return; }
    setLoading(true);
    try {
      await confirmPasswordReset(password);
      setDone(true);
    } catch (e) {
      setError(e?.message || "Failed to reset password. The link may have expired — request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: isMobile ? 16 : 28 }}>
      <div style={{ width: "100%", maxWidth: 420, background: C.white, borderRadius: 16, padding: 28, boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <img src="MainLogo-removebg-preview.png" alt="logo" style={{ width: 90, height: 50, objectFit: "contain" }} />
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "10px 4px" }}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 6 }}>Password updated</div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 18 }}>
              Your password has been reset. You're signed in with your new password.
            </p>
            <button onClick={onDone} className="sl-btn-hover" style={{ width: "100%", padding: "12px", background: C.indigo, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Continue →
            </button>
          </div>
        ) : (
          <>
            <h2 style={{ fontWeight: 700, fontSize: 22, color: C.text, margin: "0 0 6px" }}>Set a new password</h2>
            <p style={{ color: C.muted, fontSize: 13, margin: "0 0 20px" }}>Choose a password with at least 6 characters.</p>

            <div style={{ position: "relative", marginBottom: 10 }}>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New password"
                type={showPw ? "text" : "password"}
                style={{ ...inputSt, marginBottom: 0, paddingRight: 44 }}
              />
              <button onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: C.muted }}>
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
            <input
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              placeholder="Confirm new password"
              type={showPw ? "text" : "password"}
              style={inputSt}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />

            {error && <div style={{ background: "#FBEAE8", border: "1px solid #F0BEB9", borderRadius: 9, padding: "9px 12px", marginBottom: 12, fontSize: 12, color: C.red }}>{error}</div>}

            <button onClick={handleSubmit} disabled={loading} className="sl-btn-hover"
              style={{ width: "100%", padding: "13px", background: loading ? C.muted : `linear-gradient(135deg,${C.indigo} 0%,#4438D6 100%)`, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordScreen;
