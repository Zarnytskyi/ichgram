import React from "react";
import styles from "../styles/components/Button.module.scss";

const Button = ({ children, onClick, type = "button", disabled }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={styles.button}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
