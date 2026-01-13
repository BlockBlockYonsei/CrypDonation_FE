import styled from "styled-components";

export const Title = styled.div`
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 10px;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 14px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Card = styled.div`
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 12px;
  padding: 12px;
  background: #fff;
`;
