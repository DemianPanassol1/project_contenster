export type verticalProps = 'top' | 'bottom';
export type horizontalProps = 'right' | 'left' | 'center';

export interface ToastProps {
  anchorOrigin: {
    vertical: verticalProps;
    horizontal: horizontalProps;
  };
  action: (snackId: string | number) => React.ReactNode;
}
