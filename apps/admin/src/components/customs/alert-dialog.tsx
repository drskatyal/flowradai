import {
  AlertDialog as UiAlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertDialogActionProps,
  AlertDialogCancelProps,
  AlertDialogContentProps,
  AlertDialogProps as UiAlertDialogProps,
  AlertDialogTriggerProps,
} from "@radix-ui/react-alert-dialog";

interface AlertDialogStyles {
  trigger?: string;
  content?: string;
  title?: string;
  description?: string;
  action?: string;
  cancelAction?: string;
  header?: string;
  footer?: string;
}

interface AlertDialogProps extends UiAlertDialogProps {
  trigger: React.ReactNode;
  dialogTitle?: React.ReactNode;
  children?: React.ReactNode;
  classNames?: AlertDialogStyles;
  actionTitle?: React.ReactNode;
  cancelActionTitle?: React.ReactNode;
  triggerProps?: AlertDialogTriggerProps;
  contentProps?: AlertDialogContentProps;
  actionProps?: AlertDialogActionProps;
  cancelActionProps?: AlertDialogCancelProps;
  onConfirm?: React.MouseEventHandler<HTMLButtonElement>;
  onCancel?: React.MouseEventHandler<HTMLButtonElement>;
}

export const AlertDialog = ({
  trigger,
  dialogTitle,
  children,
  actionTitle = "Continue",
  cancelActionTitle = "Cancel",
  triggerProps,
  contentProps,
  actionProps,
  cancelActionProps,
  classNames,
  onConfirm,
  onCancel,
  ...props
}: AlertDialogProps) => (
  <UiAlertDialog {...props}>
    <AlertDialogTrigger
      className={classNames?.trigger}
      asChild
      {...triggerProps}
    >
      {trigger}
    </AlertDialogTrigger>
    <AlertDialogContent className={classNames?.content} {...contentProps}>
      <AlertDialogHeader className={classNames?.header}>
        <AlertDialogTitle className={classNames?.title}>
          {dialogTitle}
        </AlertDialogTitle>
        <AlertDialogDescription className={classNames?.description}>
          {children}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className={classNames?.footer}>
        <AlertDialogCancel
          {...cancelActionProps}
          className={classNames?.cancelAction}
          onClick={onCancel}
        >
          {cancelActionTitle}
        </AlertDialogCancel>
        <AlertDialogAction
          {...actionProps}
          className={classNames?.action}
          onClick={onConfirm}
        >
          {actionTitle}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </UiAlertDialog>
);
