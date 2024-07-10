import Outlink from "../utils/Outlink";

function About() {
  return (
    <div>
      {/* About the Website */}
      <h2 className="mb-1">About the Website</h2>
      <p>
        A personal website designed and developed by Mert Yaşin using{" "}
        <Outlink
          text="Classless"
          link="https://github.com/emareg/classlesscss"
        />
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
      {/* About the Author */}
      <h2 className="mb-1">About the Author</h2>
      <p>
        Mert is a <span className="text-primary">Senior Software Engineer</span>{" "}
        with 9 years of experience with a PhD level background in{" "}
        <span className="text-primary">data science</span> and{" "}
        <span className="text-primary">machine learning</span>. He has
        experience in{" "}
        <span className="text-primary">full-stack development</span>, team
        leading, game design, and graduate teaching. He is fluent in Python,
        TypeScript. He is comfortable with Java, C#, MATLAB. He is a good fit
        for autonomous squads, and fast-paced environments that require{" "}
        <span className="text-primary">rapid learning</span>.
      </p>
      <h3>Links</h3>
      <table>
        <tbody>
          <tr>
            <td className="text-right">cv</td>
            <td>
              <Outlink
                text="mrtysn.github.io/cv"
                link="https://mrtysn.github.io/cv"
              />
            </td>
          </tr>
          <tr>
            <td className="text-right">github</td>
            <td>
              <Outlink text="mrtysn" link="https://github.com/mrtysn" />
            </td>
          </tr>
          <tr>
            <td className="text-right">twitter</td>
            <td>
              <Outlink
                text="mertyas_in"
                link="https://twitter.com/mertyas_in"
              />
            </td>
          </tr>
          <tr>
            <td className="text-right">linkedin</td>
            <td>
              <Outlink
                text="mert-yasin"
                link="https://linkedin.com/in/mert-yasin/"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default About;
