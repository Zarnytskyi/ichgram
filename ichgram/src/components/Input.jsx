import React from "react";
import styles from "../styles/components/Input.module.scss";

const Input = ({ label, type, name, value, onChange, placeholder, required }) => {
  return (
    <div className={styles.inputGroup}>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        className={styles}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default Input;
