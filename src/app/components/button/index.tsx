import clsx from 'clsx';
import { FC, ReactNode } from 'react';

interface SDButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  isPending?: boolean;
  btnSize?: string;
}

const SDButton: FC<SDButtonProps> = ({
  children,
  onClick,
  className,
  type = 'button',
  disabled = false,
  isPending = false,
  btnSize = 'btn-sm',
}) => {
  return (
    <button
      type={type}
      className={clsx(
        `btn ${btnSize} ${!className ? 'btn-success' : className}`
      )}
      onClick={onClick}
      disabled={isPending ? true : disabled}
    >
      {isPending ? (
        <span className="spinner-border spinner-border-sm mx-5" />
      ) : (
        children
      )}
    </button>
  );
};

export { SDButton };
