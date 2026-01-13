import styled from "styled-components";

export const Title = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
`;

export const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

export const PresetButton = styled.button<{ $active: boolean }>`
  border-radius: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(0,0,0,0.12);
  background: ${(p) => (p.$active ? "rgba(0,0,0,0.06)" : "#fff")};
  cursor: pointer;
`;

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const Input = styled.input`
  flex: 1;
  border-radius: 10px;
  border: 1px solid rgba(0,0,0,0.12);
  padding: 10px 12px;
  outline: none;
`;

export const Unit = styled.div`
  font-size: 13px;
  color: rgba(0,0,0,0.7);
`;

export const PrimaryButton = styled.button`
  width: 100%;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid rgba(0,0,0,0.12);
  background: rgba(0,0,0,0.08);
  cursor: pointer;
`;

export const Note = styled.p`
  margin: 10px 0 0 0;
  font-size: 12px;
  color: rgba(0,0,0,0.55);
  line-height: 1.4;
`;
