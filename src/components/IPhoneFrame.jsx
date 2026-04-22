import React from 'react';
import './IPhoneFrame.css';

/**
 * IPhoneFrame
 *
 * A centered iPhone-like device frame.
 *
 * Usage:
 * <IPhoneFrame>
 *   <MyScreen />
 * </IPhoneFrame>
 */
export default function IPhoneFrame({ children, title = 'Prototype' }) {
  return (
    <div className="IPhoneFrame" aria-label="iPhone frame">
      <div className="IPhoneFrame__device" role="group" aria-label="iPhone device">
        <div className="IPhoneFrame__notch" aria-hidden="true" />

        <div className="IPhoneFrame__statusBar" aria-hidden="true">
          <span className="IPhoneFrame__time">9:41</span>
          <span className="IPhoneFrame__statusIcons">
            <span className="IPhoneFrame__dot" />
            <span className="IPhoneFrame__dot" />
            <span className="IPhoneFrame__dot" />
          </span>
        </div>

        <div className="IPhoneFrame__screen" role="region" aria-label="Phone screen">
          <div className="IPhoneFrame__screenInner">
            <div className="IPhoneFrame__topBar">
              <div className="IPhoneFrame__title" title={title}>
                {title}
              </div>
            </div>

            <div className="IPhoneFrame__content">{children}</div>
          </div>
        </div>

        <div className="IPhoneFrame__homeIndicator" aria-hidden="true" />
      </div>
    </div>
  );
}

