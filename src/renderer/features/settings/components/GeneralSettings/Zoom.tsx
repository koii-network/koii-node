import React from 'react';

export function Zoom() {
  const zoomIn = () => {
    window.main.setZoom({ zoomLevel: 0.1 });
    console.log('zoom in');
  };
  const zoomOut = () => {
    window.main.setZoom({ zoomLevel: -0.1 });
    console.log('zoom in');
  };
  const buttonClasses =
    'w-7 h-7 text-purple-3 transition-all duration-200 ease-in-out text-xl rounded bg-opacity-80 bg-white hover:text-white hover:bg-purple-3 font-bold';

  return (
    <div className="flex w-28 justify-between">
      <button onClick={zoomIn} className={buttonClasses}>
        +
      </button>
      <button onClick={zoomOut} className={buttonClasses}>
        -
      </button>
    </div>
  );
}
