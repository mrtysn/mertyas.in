import Outlink from "../utils/Outlink";

function About() {
  return (
    <div>
      <h2 className="mb-1">About the Website</h2>
      <p>
        Designed and developed by Mert Yaşin using{" "}
        <Outlink
          text="Classless"
          link="https//github.com/emareg/classlesscss"
        />
        {", "}
        <Outlink text="React" link="https//github.com/facebook/react" />
        {", and "}
        <Outlink text="Vite" link="https//github.com/vitejs/vite" />
        {"."}
      </p>
      <p>
        The source code is available on{" "}
        <Outlink text="GitHub" link="https//github.com/mrtysn/mertyas.in" />.
      </p>
      <h2 className="mb-1">About the Author</h2>
      <div className="row m-0">
        <div className="col-2 p-0">mail</div>
        <div className="col-4 p-0">
          <Outlink
            text="mert.yasin@gmail.com"
            link="mailtomert.yasin@gmail.com"
          />
        </div>
      </div>
      <div className="row m-0">
        <div className="col-2 p-0">github</div>
        <div className="col-10 p-0">
          <Outlink text="mrtysn" link="https//github.com/mrtysn" />
        </div>
      </div>
      <div className="row m-0">
        <div className="col-2 p-0">twitter</div>
        <div className="col-10 p-0">
          <Outlink text="mertyas_in" link="https//twitter.com/mertyas_in" />
        </div>
      </div>
      <div className="row m-0">
        <div className="col-2 p-0">linkedin</div>
        <div className="col-10 p-0">
          <Outlink
            text="mert-yasin"
            link="https//linkedin.com/in/mert-yasin/"
          />
        </div>
      </div>
    </div>
  );
}

export default About;
