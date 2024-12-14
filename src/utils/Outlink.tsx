import React from "react";

interface OutlinkProps {
  link: string | null;
  text: string | null;
}

const Outlink = ({ link, text }: OutlinkProps): React.ReactElement => {
  return (
    <a href={link ?? ""} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
};

export default Outlink;
