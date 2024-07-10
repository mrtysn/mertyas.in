import Outlink from "../utils/Outlink";

function Footer() {
  return (
    <footer>
      <hr className="mb-1" />
      <div className="row m-0">
        <div className="col-2 p-0">
          <small>mail:</small>
        </div>
        <div className="col-4 p-0">
          <small>
            <Outlink
              text="mert.yasin@gmail.com"
              link="mailto:mert.yasin@gmail.com"
            />
          </small>
        </div>
        <div className="col-6 p-0 text-right">
          <small>
            Designed and developed by <Outlink text="Mert Yaşin" link="" />
          </small>
        </div>
      </div>
      <div className="row m-0">
        <div className="col-2 p-0">
          <small>github:</small>
        </div>
        <div className="col-4 p-0">
          <small>
            <Outlink text="mrtysn" link="https://github.com/mrtysn" />
          </small>
        </div>
        <div className="col-6 p-0 text-right">
          <small>
            Powered by{" "}
            <Outlink
              text="Classless"
              link="https://github.com/emareg/classlesscss"
            />
            {", "}
            <Outlink text="React" link="https://github.com/facebook/react" />
            {", and "}
            <Outlink text="Vite" link="https://github.com/vitejs/vite" />{" "}
          </small>
        </div>
      </div>
      <div className="row m-0">
        <div className="col-2 p-0">
          <small>twitter:</small>
        </div>
        <div className="col-4 p-0">
          <small>
            <Outlink text="mertyas_in" link="https://twitter.com/mertyas_in" />
          </small>
        </div>
        <div className="col-6 p-0 text-right">
          <small>
            Made with <span className="p-0 colorHeart">❤</span> in İstanbul,
            Turkey
          </small>
        </div>
      </div>
      <div className="row m-0">
        <div className="col-2 p-0">
          <small>linkedin:</small>
        </div>
        <div className="col-4 p-0">
          <small>
            <Outlink
              text="mert-yasin"
              link="https://linkedin.com/in/mert-yasin/"
            />
          </small>
        </div>
        <div className="col-6 p-0 text-right">
          <small>
            <Outlink
              text="source"
              link="https://github.com/mrtysn/mertyas.in"
            />
          </small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
