import React from "react";
import { C } from "../data/constants/constants.js";
import useBreakpoint from "./shared/useBreakpoint.js";
import { Card, PageHero, SectionHeader } from "./shared/Atoms.jsx";

function NotificationsPage({ notifications = [] }) {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{ overflowY: "auto", flex: 1, background: C.bg }}>
      <PageHero
        tag="Alerts"
        title="Notification Center"
        sub="Track job alerts, recruiter actions, and profile-related updates."
      />

      <div className="sl-page-wrap" style={{ padding: isMobile ? "16px 14px" : "20px 24px" }}>
        <Card>
          <SectionHeader title="Recent Notifications" sub={`${notifications.length} total alerts`} />
          {!notifications.length ? (
            <div style={{ fontSize: 12, color: C.muted }}>No notifications available yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {notifications.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: `1px solid ${item.read ? C.border : `${C.indigo}55`}`,
                    background: item.read ? C.white : C.indigoLight,
                    borderRadius: 11,
                    padding: "10px 12px",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ fontSize: 18, lineHeight: 1 }}>{item.icon || "🔔"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5, marginBottom: 2 }}>{item.msg}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{item.time}</div>
                  </div>
                  {!item.read && (
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.indigo, marginTop: 4 }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default NotificationsPage;
