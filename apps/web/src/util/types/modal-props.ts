export interface BaseModalChildrenProps {
    onClose?: () => void;
}

export interface BaseModalProps {
    opened: boolean;
    onClose: () => void;
}
