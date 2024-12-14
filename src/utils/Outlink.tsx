import React from "react";

interface OutlinkProps {
  link: string;
  text: string;
}

const Outlink = ({ link, text }: OutlinkProps): React.ReactElement => {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
};

export default Outlink;
