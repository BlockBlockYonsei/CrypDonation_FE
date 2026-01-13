import React, { useEffect } from "react";
import { createPortal } from "react-dom"
import * as S from "./Modal.style"

type Props = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({open, onClose, children }: Props) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escpate") onClose();
        }

        document.addEventListener("keydown", onKeyDown);

        // 스크롤 잠금 (모달 열렸을 때 배경 스크롤 방지)
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    const modalRoot = document.getElementById("modal-root");
    if (!modalRoot) return null;

    return createPortal(
        <S.Backdrop onClick={onClose}>
            <S.Dialog onClick={(e) => e.stopPropagation()}>
                <S.CloseButton type="button" aria-label="Close" onClick={onClose}>
                    x
                </S.CloseButton>
                <S.Body>{children}</S.Body>
            </S.Dialog>
        </S.Backdrop>,
        modalRoot
    )
}