import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    width={200}
    height={50}
    {...props}
  >
    <style>
      {
        '.logo-text { font-family: "PT Sans", sans-serif; font-size: 38px; font-weight: 700; }'
      }
    </style>
    <text x={0} y={35} className="logo-text fill-foreground">
      Caça
    </text>
    <text x={95} y={35} className="logo-text fill-primary">
      Time
    </text>
  </svg>
);

export default Logo;
