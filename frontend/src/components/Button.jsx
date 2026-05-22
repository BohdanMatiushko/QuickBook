/**
 * Перевикористовувана кнопка (стилі з index.css: .btn, .btn-primary, .btn-secondary)
 */
function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}) {
  const classes = ['btn', `btn-${variant}`, className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}

export default Button;
