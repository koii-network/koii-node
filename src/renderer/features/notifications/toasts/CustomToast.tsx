import {
  CheckSuccessLine,
  CloseLine,
  Icon,
  InformationCircleLine,
  WarningTriangleLine,
} from '@_koii/koii-styleguide';
import React, { SVGProps } from 'react';
import toast, { Toast, ToastOptions } from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';

type ToastVariant = 'info' | 'success' | 'error' | 'warning';

type PropsType = {
  t: Toast;
  content: React.ReactNode;
  variant?: ToastVariant;
  dismissable?: boolean;
  onClose?: () => void;
} & ToastOptions;

export const renderCustomToast = ({
  content,
  dismissable,
  variant,
  onClose,
  position,
}: Omit<PropsType, 't'>) =>
  toast.custom(
    (t) => (
      <InfoToast
        t={t}
        content={content}
        variant={variant}
        dismissable={dismissable}
        onClose={onClose}
      />
    ),
    {
      duration: dismissable ? Infinity : 4500,
      position,
    }
  );

function InfoToast({
  t,
  content,
  variant = 'info',
  dismissable = false,
  onClose,
}: PropsType) {
  const [show, setShow] = React.useState(true);

  const variantClasses = {
    info: 'bg-finnieTeal-100',
    success: 'bg-finnieEmerald-light',
    error: 'bg-finnieRed',
    warning: 'bg-finnieOrange',
  } as const;

  const getIconSource = () => {
    const icons: Record<
      ToastVariant,
      (props: SVGProps<SVGSVGElement>) => JSX.Element
    > = {
      info: InformationCircleLine,
      success: CheckSuccessLine,
      error: WarningTriangleLine,
      warning: WarningTriangleLine,
    } as const;

    return icons[variant];
  };

  const handleDismiss = () => {
    setShow(false);
    toast.dismiss(t.id);
    onClose?.();
  };

  const iconSource = getIconSource();

  if (!show) {
    return null;
  }

  return (
    <div
      className={twMerge(
        `${t.visible ? 'animate-enter' : 'animate-leave'}`,
        'flex relative items-center gap-2 p-4 rounded-lg shadow-md justify-center text-finnieBlue',
        variantClasses[variant]
      )}
    >
      <Icon source={iconSource} className="w-5 h-5 self-start mt-px" />
      <div className="flex-grow">{content}</div>

      {dismissable && (
        <div
          className="absolute p-1 bg-finnieBlue-light-secondary rounded-full cursor-pointer -top-2 -right-2"
          role="button"
          tabIndex={0}
          onClick={handleDismiss}
          onKeyDown={(e) => e.key === 'Enter' && handleDismiss()}
        >
          <CloseLine className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
