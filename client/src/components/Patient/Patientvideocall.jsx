import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import '../doctor/videocall.css'

const APP_ID = 'c2aafdc9c22c4da29c3b2286df015ac2';  
const CHANNEL_NAME = 'doctor-patient-room';

const VideoCall = () => {
  const client = useRef(null);
  const localVideoRef = useRef(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [error, setError] = useState(null);

  const fetchToken = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/token?channel=${CHANNEL_NAME}`);
      return response.data.token;
    } catch (err) {
      setError('Failed to fetch token');
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      // Fetch the token from the backend
      const token = await fetchToken();
      if (!token) return;

      try {
        // Join the channel with the token
        await client.current.join(APP_ID, CHANNEL_NAME, token, null);

        // Create local tracks for audio and video
        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        camTrack.play(localVideoRef.current); // Display local video

        // Publish tracks to Agora
        await client.current.publish([micTrack, camTrack]);

        // Listen for remote users
        client.current.on('user-published', async (user, mediaType) => {
          await client.current.subscribe(user, mediaType);
          if (mediaType === 'video') {
            user.videoTrack.play(`remote-player-${user.uid}`);
            setRemoteUsers((prev) => [...prev, user]);
          }
        });
      } catch (err) {
        setError('Failed to join the channel');
        console.error(err);
      }
    };

    init();

    return () => {
      // Cleanup when the component unmounts
      if (client.current) client.current.leave();
    };
  }, []);

  return (
    <div>
      <h2>Video Call</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div className="video-container">
        <div ref={localVideoRef} className="local-video">
          <p>Your Video</p>
        </div>
        {remoteUsers.length > 0 && (
          <div>
            {remoteUsers.map((user) => (
              <div key={user.uid} id={`remote-player-${user.uid}`} className="remote-video">
                <p>Remote Video ({user.uid})</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
