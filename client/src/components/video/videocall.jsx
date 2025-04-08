// src/components/doctor/VideoCall.jsx
import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const VideoCall = () => {
  // Grab the roomID param (e.g. /video-call/room-ABC)
  const roomID = "logith";

  const containerRef = useRef(null);

  const setupZegoCall = async (element) => {
    // Replace these with your actual ZEGOCLOUD credentials
    const appID = 510870875;  
    const serverSecret = 'ed84c79ea4e2bc3a7e532f7b365936dd'; 

    const userID = String(Date.now());
    const userName = 'DoctorUser';

    // Create token
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID || 'default-doctor-room',
      userID,
      userName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: 'Copy Link',
          url: `${window.location.origin}/video-call/${roomID}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      showScreenSharingButton: true,
    });
  };

  useEffect(() => {
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

export default VideoCall;
