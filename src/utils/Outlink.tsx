interface OutlinkProps {
  link: string;
  text: string;
}

const Outlink = ({ link, text }: OutlinkProps): JSX.Element => {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
};

export default Outlink;
