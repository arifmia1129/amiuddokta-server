import type { ChangeEvent, FC, LegacyRef } from "react";

type Props = {
  disabled?: boolean;
  inputRef: LegacyRef<HTMLInputElement>;
  onClick: () => void;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
};

export const ButtonFile: FC<Props> = (props) => {
  const { disabled = false, inputRef, onClick, onChange } = props;

  return (
    <button
      type="button"
      className="rounded-lg bg-blue-500 px-4 py-2.5 font-medium normal-case text-white shadow-xl shadow-blue-500/50"
      onClick={onClick}
      disabled={disabled}
      title="Press to clipboard"
    >
      Choose a file
      <input
        ref={inputRef}
        type="file"
        name="image"
        accept="image/png, image/gif, image/jpeg"
        hidden
        onChange={onChange}
      />
    </button>
  );
};
