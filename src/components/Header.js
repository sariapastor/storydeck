import PropTypes from "prop-types";
import Controls from "./header/Controls";

const Header = ({ title, setUpdating }) => {
  return (
    <header>
      <div data-tauri-drag-region className="titlebar">
        <div className="window-title">
          <h3>{title}</h3>
        </div>
        <Controls setUpdating={setUpdating} />
      </div>
      <div className="titlebar-spacer"></div>
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  setUpdating: PropTypes.func.isRequired,
};

export default Header;
