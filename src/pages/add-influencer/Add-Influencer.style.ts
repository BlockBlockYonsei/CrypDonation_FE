import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

export const Modal = styled.div`
  width: min(520px, calc(100vw - 32px));
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
`;

export const Header = styled.div`
  padding: 16px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 18px;
`;

export const CloseBtn = styled.button`
  border: 0;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
`;

export const Body = styled.div`
  padding: 16px;
`;

export const Label = styled.div`
  font-size: 13px;
  margin-bottom: 8px;
  color: #444;
`;

export const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  outline: none;
`;

export const Dropdown = styled.div`
  margin-top: 8px;
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
`;

export const Item = styled.button`
  width: 100%;
  padding: 12px;
  border: 0;
  background: #fff;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  &:hover {
    background: #f7f7f7;
  }
`;

export const ItemMain = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

export const ItemSub = styled.div`
  font-size: 12px;
  color: #777;
`;

export const Status = styled.div<{ $error?: boolean }>`
  margin-top: 10px;
  font-size: 13px;
  color: ${(p) => (p.$error ? "#c0392b" : "#2d3436")};
`;

export const Actions = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

export const SecondaryBtn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
`;

export const PrimaryBtn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 0;
  background: #111;
  color: #fff;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
