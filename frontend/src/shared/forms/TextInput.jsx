import { useLanguage } from "../../i18n/LanguageContext";

export default function TextInput({ label, error, required, id, ...props }) {
  const { t } = useLanguage();
  const translatedProps = {
    ...props,
    placeholder: props.placeholder ? t(props.placeholder) : props.placeholder,
  };

  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {t(label)} {required ? <span className="text-red-700">*</span> : null}
      </label>
      <input className="form-field" id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...translatedProps} />
      {error ? (
        <p className="form-error" id={`${id}-error`}>
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}
