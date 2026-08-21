import { useLanguage } from "../../i18n/LanguageContext";

export default function Select({ label, error, required, id, options = [], ...props }) {
  const { t } = useLanguage();

  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {t(label)} {required ? <span className="text-red-700">*</span> : null}
      </label>
      <select className="form-field" id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </select>
      {error ? (
        <p className="form-error" id={`${id}-error`}>
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}
