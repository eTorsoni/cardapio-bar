function AuthLayout({ title, subtitle, children, footerText, footerLink, onFooterClick }) {
  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark">🍺</span>
          <div>
            <p className="auth-brand-label">Happy Hour Bar</p>
            <h1>{title}</h1>
          </div>
        </div>

        <p className="auth-subtitle">{subtitle}</p>

        {children}

        <p className="auth-footer">
          {footerText}{" "}
          <button type="button" className="auth-link-button" onClick={onFooterClick}>
            {footerLink}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
