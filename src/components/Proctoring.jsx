import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const Proctoring = ({ onViolation }) => {
  const webcamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState("loading");

  // Draggable state
  const [position, setPosition] = useState({ x: window.innerWidth - 260, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models"); // needed for direction detection
      setModelsLoaded(true);
      setStatus("ok");
    };
    loadModels();
  }, []);

  // Draggable logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newX = Math.max(0, Math.min(window.innerWidth - 240, e.clientX - dragStart.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragStart.y));
      setPosition({ x: newX, y: newY });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Face + direction detection loop
  useEffect(() => {
    if (!modelsLoaded || !webcamRef.current) return;

    const interval = setInterval(async () => {
      const video = webcamRef.current.video;
      if (!video || video.readyState !== 4) return;

      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        // ❌ NO FACE → DISQUALIFY
        if (detections.length === 0) {
          setStatus("NO_FACE");
          onViolation?.("DISQUALIFIED", {
            reason: "No face detected"
          });
          return;
        }

        // ❌ MULTIPLE FACES → DISQUALIFY
        if (detections.length > 1) {
          setStatus("MULTIPLE_FACES");
          onViolation?.("DISQUALIFIED", {
            reason: "Multiple faces detected"
          });
          return;
        }

        // ✅ SINGLE FACE → CHECK DIRECTION
        const landmarks = detections[0].landmarks;
        const nose = landmarks.getNose();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        // Calculate center
        const eyeCenterX =
          (leftEye[0].x + rightEye[3].x) / 2;

        const noseX = nose[3].x;

        // 🔥 Looking left/right detection
        const diff = Math.abs(noseX - eyeCenterX);

        if (diff > 25) {
          setStatus("LOOKING_AWAY");
          onViolation?.("DISQUALIFIED", {
            reason: "User looking away"
          });
          return;
        }

        // ✅ Everything OK
        setStatus("ok");

      } catch (err) {
        console.log("Detection error:", err);
      }
    }, 800); // faster detection

    return () => clearInterval(interval);
  }, [modelsLoaded, onViolation]);

  if (!modelsLoaded) {
    return <div style={{ color: "white" }}>Loading proctoring...</div>;
  }

  const getColor = () => {
    switch (status) {
      case "ok": return "green";
      case "NO_FACE": return "orange";
      case "MULTIPLE_FACES": return "red";
      case "LOOKING_AWAY": return "red";
      default: return "gray";
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        border: `3px solid ${getColor()}`,
        borderRadius: 10,
        overflow: "hidden",
        zIndex: 9999,
        cursor: isDragging ? "grabbing" : "grab",
        transition: isDragging ? "none" : "all 0.1s ease"
      }}
      onMouseDown={handleMouseDown}
    >
      <Webcam
        ref={webcamRef}
        audio={false}
        width={220}
        height={160}
        screenshotFormat="image/jpeg"
        style={{ display: "block" }}
      />

      <div
        style={{
          textAlign: "center",
          fontSize: 12,
          background: "#000",
          color: getColor(),
          padding: 4,
          userSelect: "none"
        }}
      >
        {status}
      </div>
    </div>
  );
};

export default Proctoring;