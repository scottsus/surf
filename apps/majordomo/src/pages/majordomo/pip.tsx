/**
 * pip: Picture-in-picture
 * Plays when Surf is working, then user changes tab.
 * This will screencast working tab into active tab.
 */

import { useEffect, useRef, useState } from "react";

export function Pip() {
  const [showPip, setShowPip] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const tabChangedListener = async (message: any) => {
      if (message.action !== "tab_changed") {
        return;
      }

      // https://github.com/electron/electron/issues/27139
      const stream = await (navigator.mediaDevices as any).getUserMedia({
        video: {
          mandatory: {
            chromeMediaSource: "tab",
            chromeMediaSourceId: message.streamId,
          },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        setShowPip(true);
        videoRef.current.addEventListener("ended", () => {
          setShowPip(false);
        });
      }
    };

    chrome.runtime.onMessage.addListener(tabChangedListener);
    return () => chrome.runtime.onMessage.removeListener(tabChangedListener);
  }, []);

  return (
    <div
      className="pointer-events-auto fixed z-[2147483648] rounded-lg"
      style={{
        right: "5vw",
        bottom: "10vh",
        width: "25vw",
        border: "1px solid #D6DFFF",
        display: showPip ? "block" : "none",
        boxShadow: "0 0 10px 0px rgb(91, 126, 255)",
        overflow: "hidden",
      }}
    >
      <video ref={videoRef} autoPlay className="w-full rounded-md" />
    </div>
  );
}
