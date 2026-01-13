import styled from "styled-components";

export const Title = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    text-align: left;
    font-size: 13px;
    padding: 10px 8px;
    border-bottom: 1px solid rgba(0,0,0,0.08);
  }

  th {
    color: rgba(0,0,0,0.6);
    font-weight: 700;
  }
`;
