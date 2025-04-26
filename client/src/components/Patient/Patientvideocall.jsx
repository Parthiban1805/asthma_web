// src/components/Patient/Patientvideocall.jsx
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const PatientVideoCall = () => {
  // Grab the :roomID from the URL (e.g. /patient-video-call/room-123)
  const roomID = "logith";

  // A ref for attaching the ZEGOCLOUD UI kit container
  const containerRef = useRef(null);

  // Function that initializes and joins the ZEGOCLOUD call
  const setupZegoCall = async (element) => {
    // Replace these with your actual ZEGOCLOUD credentials
const appID = 1431823665
const serverSecret = "84b8d04799aa4045c4644bb38259753e"   // Generate a unique userID for the local participant
    const userID = String(Date.now());
    // Possibly fetch the patient’s name from localStorage or state
    const userName = 'PatientUser';

    // Build a dev kit token (for testing only)
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID || 'default-patient-room',
      userID,
      userName
    );

    // Create the UI kit instance with the token
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Join the call with scenario + config
    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Copy Link',
          url: `${window.location.origin}/patient-video-call/${roomID}`,
        },
      ],
      scenario: {
        // e.g. group calls
        mode: ZegoUIKitPrebuilt.VideoConference,
        // or 1-on-1 calls:
        // mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: true,
    });
  };

  useEffect(() => {
    // Once containerRef is attached, set up the call
    if (containerRef.current) {
      setupZegoCall(containerRef.current);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100vh' }}
    />
  );
};

export default PatientVideoCall;
