import React from "react";
import "./StarBorder.css";

type StarBorderProps = React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  color?: string;
  speed?: React.CSSProperties["animationDuration"];
  thickness?: number;
  children?: React.ReactNode;
};

const StarBorder = ({
  as,
  className = "",
  color = "white",
  speed = "6s",
  thickness = 1,
  children,
  style,
  ...rest
}: StarBorderProps) => {
  const Component = (as || "button") as React.ElementType;

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

  return React.createElement(
    Component,
    {
      className: `star-border-container ${className}`,
      ...rest,
      style: mergedStyle,
    },
    [
      <div className="star-border-effects" aria-hidden="true" key="effects">
        <div className="border-gradient-bottom"></div>
        <div className="border-gradient-top"></div>
      </div>,
      <div className="inner-content" key="content">{children}</div>,
    ]
  );
};

export default StarBorder;
