import React from "react";
import "./StarBorder.css";

type StarBorderProps<T extends React.ElementType> =
  React.ComponentPropsWithoutRef<T> & {
    as?: T;
    className?: string;
    children?: React.ReactNode;
    color?: string;
    speed?: React.CSSProperties["animationDuration"];
    thickness?: number;
  };

const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "white",
  speed = "6s",
  thickness = 1,
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = (as || "button") as T;

  const { style, ...restProps } = rest as React.ComponentPropsWithoutRef<T>;

  type StarBorderStyle = React.CSSProperties & {
    ["--sb-color"]?: string;
    ["--sb-speed"]?: React.CSSProperties["animationDuration"];
    ["--sb-thickness"]?: string;
  };

  const mergedStyle: StarBorderStyle = {
    ...(style ?? {}),
    "--sb-color": color,
    "--sb-speed": speed,
    "--sb-thickness": `${thickness}px`,
    padding: `var(--sb-thickness)`,
  };

  return (
    <Component
      className={`star-border-container ${className}`}
      {...restProps}
      style={mergedStyle}
    >
      <div className="star-border-effects" aria-hidden="true">
        <div className="border-gradient-bottom"></div>
        <div className="border-gradient-top"></div>
      </div>
      <div className="inner-content">{children}</div>
    </Component>
  );
};

export default StarBorder;
