import React from 'react';
import Editable from './Editable';

export default function MonitorSetting() {
  return (
    <div className="flex flex-col items-center">
      <div className="font-extrabold text-2xl py-3">Monitor Setting</div>
      <Editable />
    </div>
  );
}
