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
          ? "#BBDEFB"
          : isError
          ? "#FFCDD2"
          : "#FFFFFF"
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
        ? "#E3F2FD"
        : isError
        ? "#FFEBEE"
        : "#F5F9FF",
      border: `2px solid ${
        isSuccess
          ? "#1565C0"
          : isError
          ? "#D32F2F"
          : "#90CAF9"
      }`,
      color: isSuccess
        ? "#1565C0"
        : isError
        ? "#D32F2F"
        : "#1565C0",
    },

    title: {
      margin: "0 0 8px 0",
      fontSize: "20px",
      fontWeight: "800",
      color: isSuccess
        ? "#0D47A1"
        : isError
        ? "#C62828"
        : "#E65100",
    },

    message: {
      margin: "0 0 20px 0",
      fontSize: "14px",
      color: "#526579",
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
        : "#0D47A1",
      background: isSuccess
        ? "#1565C0"
        : isError
        ? "#D32F2F"
        : "#FFEB3B",
      boxShadow: isSuccess
        ? "0 3px 0 #0D47A1"
        : isError
        ? "0 3px 0 #9A0007"
        : "0 3px 0 #90CAF9",
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