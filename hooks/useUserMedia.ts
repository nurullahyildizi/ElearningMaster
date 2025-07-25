import { useState, useEffect } from 'react';

export const useUserMedia = (requestedMedia: MediaStreamConstraints) => {
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const enableStream = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia(requestedMedia);
                setMediaStream(stream);
            } catch (err) {
                console.error("Error accessing user media:", err);
            }
        };

        if (!mediaStream) {
            enableStream();
        }

        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => {
                    track.stop();
                });
            }
        };
    }, [mediaStream, requestedMedia]);

    return mediaStream;
};
