import PropTypes from "prop-types";
import BackButton from "./header/BackButton";
import Controls from "./header/Controls";

const Header = ({ title, setUpdating, viewStack, setViewStack }) => {
  return (
    <header>
      <div data-tauri-drag-region className="titlebar">
        <BackButton viewStack={viewStack} setViewStack={setViewStack} />
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
