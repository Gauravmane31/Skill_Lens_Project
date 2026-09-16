import React from "react";
import { C } from "../../constants/constants.js";
import COMPANY_LOGOS from "../../constants/companyLogos.js";

const CompanyLogo = ({ company, fallback, size = 28 }) => {
  const logo = COMPANY_LOGOS[company];
  const darkTile = company === "Palantir" || company === "Palo Alto";

  return (
    <div
      style={{
        width: size + 8,
        height: size + 8,
        background: darkTile ? "#000" : C.white,
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        border: `1px solid ${C.indigo}22`,
      }}
    >
      {logo ? (
        <img
          src={logo}
          alt={`${company} logo`}
          style={{ width: darkTile ? size + 4 : size, height: size, objectFit: "contain" }}
        />
      ) : (
        <span style={{ fontSize: 10, fontWeight: 700, color: C.indigo, textAlign: "center", lineHeight: 1.1 }}>
          {fallback || company || "Company"}
        </span>
      )}
    </div>
  );
};

export default CompanyLogo;
