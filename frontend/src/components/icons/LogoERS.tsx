import { ComponentPropsWithoutRef } from "react";

const LogoERS = (props: ComponentPropsWithoutRef<"svg">) => {
  return (
    <svg
      width="512"
      height="512"
      viewBox="0 0 512 512"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      {...props}
    >
      <g id="calendar" transform="matrix(1.3120269,0,0,1.2845602,-40.335415,-54.620102)">
        <path
          fillOpacity="0"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M 139.10275,425.53093 H 45.986416 V 121.33984 H 112.48754 L 140.10938,58.09 v 102.2636 l 27.19701,-42.01907 H 296.93785 L 323.10979,58.09 v 102.2636 l 33.36601,-44.86766 h 49.25016 v 111.4639 l -39.1471,-39.07828 H 85.124278"
          id="outline"
        />
        <path
          fillOpacity="0"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="20, 70"
          d="M 112.48754,262.30374 H 225.32055 339.23408"
          id="dashes"
        />
        <path
          fillOpacity="0"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m 258.78814,419.11468 v -44.81234 l 87.20594,-87.05266 c 0,0 24.00173,-33.67609 49.31482,-8.4075 27.36326,27.31516 -7.78511,47.79 -7.78511,47.79 l -42.56402,-39.3825 42.56402,39.3825 -87.72309,89.64312 z"
          id="pen"
        />
        <path
          fillOpacity="0"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m 92.004341,382.95874 52.417769,-47.78078 v -29.57374 l -31.93457,-1.51188 v 40.94968 l 37.25392,35.6397 33.43064,-29.9886 21.26816,31.50968 37.98348,-18.1978 43.30285,20.47484 v 0"
          id="signature"
        />
      </g>
    </svg>
  );
};

export default LogoERS;
