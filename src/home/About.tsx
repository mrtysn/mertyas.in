import { useState } from "react";
import Outlink from "../utils/Outlink";
import { useEffect } from "react";
import githubIcon from "../assets/icons/github.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import twitterIcon from "../assets/icons/twitter.svg";
import fileTextIcon from "../assets/icons/file-text.svg";

const snapshotDate = new Date("2024-07-12");
const snapshotExperience = 10;

const calculateExperience = (): number => {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - snapshotDate.getTime());
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  return diffYears;
};

const AboutWebsite = () => (
  <>
    <h2 className="mb-1">About the Website</h2>
    <p>
      A personal website designed and developed by Mert Yaşin using{" "}
      <Outlink text="Classless" link="https://github.com/emareg/classlesscss" />
      {", "}
      <Outlink text="React" link="https://github.com/facebook/react" />
      {", and "}
      <Outlink text="Vite" link="https://github.com/vitejs/vite" />
      {"."}
    </p>
    <p>
      The source code is available on{" "}
      <Outlink text="GitHub" link="https://github.com/mrtysn/mertyas.in" />.
    </p>
  </>
);

const AboutAuthor = ({ experience }: { experience: number | null }) => (
  <>
    <h2 className="mb-1">About</h2>
    <p>
      Mert is a <span className="text-primary">Senior Software Engineer</span>{" "}
      with {experience ? experience + snapshotExperience : snapshotExperience}+
      years of experience and PhD studies in{" "}
      <span className="text-primary">data science</span> and{" "}
      <span className="text-primary">machine learning</span>. He has experience
      in <span className="text-primary">full-stack</span> development,{" "}
      <span className="text-primary">game</span> development, team leading, and
      graduate teaching. He is fluent in Python, TypeScript, C#. He is
      comfortable with Java, MATLAB. He is a good fit for{" "}
      <span className="text-primary">autonomous squads</span>, and fast-paced
      environments that require rapid learning.
    </p>
    <h2>Now</h2>
    <p>
      Mert is currently working as{" "}
      <span className="text-primary">Lead Backend Engineer</span> at{" "}
      <Outlink text="Cypher Games" link="https://www.cyphergames.com/" />.
    </p>
  </>
);

const AuthorLinks = () => (
  <>
    <h2>Links</h2>
    <table>
      {/* <thead></thead> */}
      <tbody>
        <tr>
          <td>
            <img src={fileTextIcon} width={25} height={25} alt="cv" />
          </td>
          <td className="text-left">cv</td>
          <td>
            <Outlink
              text="mrtysn.github.io/cv"
              link="https://mrtysn.github.io/cv"
            />
          </td>
        </tr>
        <tr>
          <td>
            <img src={githubIcon} width={25} height={25} alt="github" />
          </td>
          <td className="text-left">github</td>
          <td>
            <Outlink text="mrtysn" link="https://github.com/mrtysn" />
          </td>
        </tr>
        <tr>
          <td>
            <img src={twitterIcon} width={25} height={25} alt="twitter" />
          </td>
          <td className="text-left">twitter</td>
          <td>
            <Outlink text="mertyas_in" link="https://twitter.com/mertyas_in" />
          </td>
        </tr>
        <tr>
          <td>
            <img src={linkedinIcon} width={25} height={25} alt="linkedin" />
          </td>
          <td className="text-left">linkedin</td>
          <td>
            <Outlink
              text="mert-yasin"
              link="https://linkedin.com/in/mert-yasin/"
            />
          </td>
        </tr>
        <tr>
          <td>
            <img src={githubIcon} width={25} height={25} alt="github" />
          </td>
          <td className="text-left">github</td>
          <td>
            <Outlink text="mert-cypher" link="https://github.com/mert-cypher" />
          </td>
        </tr>
      </tbody>
    </table>
  </>
);

function About() {
  const [experience, setExperience] = useState<number | null>(null);

  useEffect(() => {
    setExperience(calculateExperience());
  }, []);

  return (
    <div>
      <AboutAuthor experience={experience} />
      <AuthorLinks />
      <AboutWebsite />
    </div>
  );
}

export default About;
