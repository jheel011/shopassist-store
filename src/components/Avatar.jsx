import { useState } from 'react';

export default function Avatar({ user, size = 36 }) {
  const [bad, setBad] = useState(false);
  const initial = (user?.name || '?').trim()[0]?.toUpperCase();
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {user?.avatar && !bad ? <img src={user.avatar} alt="" onError={() => setBad(true)} /> : initial}
    </span>
  );
}
