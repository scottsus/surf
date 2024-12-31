import { useCallback, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

import logo from "../../assets/img/logo.svg";
import { Pane } from "./pane";

export function Sticker() {
  const [showSticker, setShowSticker] = useState(true);
  const [lastDragTime, setLastDragTime] = useState(0);

  const onClick = () => {
    const currentTime = Date.now();
    if (currentTime - lastDragTime > 200) {
      setShowSticker(false);
    }
  };
  const onDrag = (e: DraggableEvent, data: DraggableData) => {
    if (data.deltaY !== 0) {
      setLastDragTime(Date.now());
    }
  };

  return (
    <div className="absolute left-0 top-56 z-50">
      {showSticker ? (
        <Draggable axis="y" onDrag={onDrag}>
          <div className="relative cursor-pointer" onClick={onClick}>
            <img
              src={logo}
              alt="Apriora"
              className="pointer-events-none h-24 w-24 select-none rounded-md"
            />
          </div>
        </Draggable>
      ) : (
        <Pane closePane={() => setShowSticker(true)} />
      )}
    </div>
  );
}
