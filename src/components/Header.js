import PropTypes from "prop-types";
import Controls from "./header/Controls";

const Header = ({ title, setUpdating }) => {
  return (
    <header>
      <div data-tauri-drag-region className="titlebar">
        {/* <div className="titlebar-button" id="titlebar-minimize">
          <img
            src="https://api.iconify.design/mdi:window-minimize.svg"
            alt="minimize"
          />
        </div>
        <div className="titlebar-button" id="titlebar-maximize">
          <img
            src="https://api.iconify.design/mdi:window-maximize.svg"
            alt="maximize"
          />
        </div>
        <div className="titlebar-button" id="titlebar-close">
          <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
        </div> */}
        <div className="window-title">
          <h3>{title}</h3>
        </div>
        <Controls setUpdating={setUpdating} />
      </div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  setUpdating: PropTypes.func.isRequired,
};

export default Header;
