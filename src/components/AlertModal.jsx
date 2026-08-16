function AlertModal({
  isOpen,
  onClose,
  type = "success",
  title,
  message,
}) {
  if (!isOpen) return null;

  const isSuccess = type === "success";
  const isError = type === "error";

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.55)",
      backdropFilter: "blur(2px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: "15px",
      boxSizing: "border-box",
    },

    modal: {
      background: "#fff",
      borderRadius: "22px",
      padding: "26px 20px",
      maxWidth: "380px",
      width: "100%",
      textAlign: "center",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      border: `2px solid ${
        isSuccess
          ? "#C8E6C9"
          : isError
          ? "#FFCDD2"
          : "#FFF59D"
      }`,
      animation: "popIn 0.25s ease-out",
    },

    iconBox: {
      width: "65px",
      height: "65px",
      borderRadius: "50%",
      margin: "0 auto 15px auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "30px",
      background: isSuccess
        ? "#E8F5E9"
        : isError
        ? "#FFEBEE"
        : "#FFFDE7",
      border: `2px solid ${
        isSuccess
          ? "#2E7D32"
          : isError
          ? "#D32F2F"
          : "#FBC02D"
      }`,
      color: isSuccess
        ? "#2E7D32"
        : isError
        ? "#D32F2F"
        : "#F57F17",
    },

    title: {
      margin: "0 0 8px 0",
      fontSize: "20px",
      fontWeight: "800",
      color: isSuccess
        ? "#1B5E20"
        : isError
        ? "#C62828"
        : "#E65100",
    },

    message: {
      margin: "0 0 20px 0",
      fontSize: "14px",
      color: "#556B4D",
      lineHeight: "1.5",
      whiteSpace: "pre-line",
    },

    button: {
      width: "100%",
      padding: "12px",
      border: "none",
      borderRadius: "12px",
      fontWeight: "800",
      fontSize: "14px",
      cursor: "pointer",
      textTransform: "uppercase",
      color: isSuccess
        ? "#fff"
        : isError
        ? "#fff"
        : "#1B5E20",
      background: isSuccess
        ? "#2E7D32"
        : isError
        ? "#D32F2F"
        : "#FFEB3B",
      boxShadow: isSuccess
        ? "0 3px 0 #1B5E20"
        : isError
        ? "0 3px 0 #9A0007"
        : "0 3px 0 #FBC02D",
    },
  };

  return (
    <div
      style={styles.overlay}
      role="presentation"
    >
      <div
        style={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-modal-title"
      >
        <div style={styles.iconBox}>
          {isSuccess
            ? "✓"
            : isError
            ? "✕"
            : "ℹ"}
        </div>

        <h3
          id="alert-modal-title"
          style={styles.title}
        >
          {title ||
            (isSuccess
              ? "Berhasil!"
              : "Pemberitahuan")}
        </h3>

        <p style={styles.message}>
          {message}
        </p>

        <button
          type="button"
          style={styles.button}
          onClick={onClose}
        >
          Oke
        </button>
      </div>
    </div>
  );
}

export default AlertModal;