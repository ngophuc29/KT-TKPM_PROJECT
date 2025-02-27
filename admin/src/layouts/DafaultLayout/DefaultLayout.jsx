import Header from "../Header/Header";
import PropTypes from "prop-types";

export default function DefaultLayout({ children }) {
  return (
    <main className="h-full">
      <Header />
      <div className="default-layout w-100">{children}</div>
    </main>
  );
}

DefaultLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
