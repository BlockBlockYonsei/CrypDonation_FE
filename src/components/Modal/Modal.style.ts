import styled from "styled-components";

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

export const Dialog = styled.div`
  width: min(760px, calc(100vw - 32px));
  max-height: calc(100vh - 64px);
  background: #fff;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.12);
  box-shadow: 0 24px 80px rgba(0,0,0,0.35);
  position: relative;
  overflow: hidden;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.18);
  background: rgba(0,0,0,0.03);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
`;

export const Body = styled.div`
  padding: 18px 18px 20px 18px;
  overflow: auto;
  max-height: calc(100vh - 64px);
`;
