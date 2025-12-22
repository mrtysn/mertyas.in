interface OutlinkProps {
  link: string;
  text: string;
}

const Outlink = ({ link, text }: OutlinkProps) => {
  // Defensive: handle empty strings
  if (!link || !link.trim()) {
    return <span>{text}</span>;
  }

  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
};

export default Outlink;
