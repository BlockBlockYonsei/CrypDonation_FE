import React from "react";
import type { Donation } from "../types";
import * as S from "./RecentDonation.style";

type Props = { donations: Donation[] };

export default function RecentDonations({ donations }: Props) {
  return (
    <div>
      <S.Title>Recent Donations</S.Title>
      <S.Table>
        <thead>
          <tr>
            <th>Donor</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((d) => (
            <tr key={d.id}>
              <td>{d.donor}</td>
              <td>{d.amount}</td>
              <td>{d.createdAT}</td>
            </tr>
          ))}
        </tbody>
      </S.Table>
    </div>
  );
}
