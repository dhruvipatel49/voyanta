export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner-wrapper">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <span className="spinner-icon">✈️</span>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}
