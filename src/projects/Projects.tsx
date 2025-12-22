import Outlink from "../utils/Outlink";
const Project = ({
  text,
  link,
  year,
}: {
  text: string;
  link: string;
  year: string;
}) => {
  return (
    <tr>
      <td>{text}</td>
      <td>{year}</td>
      <td>
        <Outlink link={link} text={"Link"} />
      </td>
    </tr>
  );
};

function Projects() {
  return (
    <div>
      <h2>Projects</h2>
      <table>
        <tbody>
          <Project
            text="Personal Website"
            year="2024"
            link="https://github.com/mrtysn/mertyas.in"
          />
          <Project
            text="Procedural Pattern Generation"
            year="2021"
            link="https://github.com/inzva/procedural-pattern-generation"
          />
          <Project text="PhD neuroscience project" year="2018-2021" link="" />
          <Project text="PhD bioinformatics project" year="2018-2021" link="" />
          <Project
            text="React CV Template"
            year="2018"
            link="https://github.com/mrtysn/cv"
          />
          <Project
            text="Long short-term memory (LSTM) implementation"
            year="2016"
            link="https://github.com/mrtysn/lstm"
          />
        </tbody>
      </table>
    </div>
  );
}

export default Projects;
