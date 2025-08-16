import React from "react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { EMERALD, GREYS } from "../../theme";

export default function IncomeVsExpenseBar({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={GREYS.grid} />
          <XAxis dataKey="name" stroke={GREYS.axis} />
          <YAxis stroke={GREYS.axis} />
          <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${GREYS.border}` }} />
          <Legend />
          <Bar dataKey="Income" fill={EMERALD[500]} radius={[8,8,0,0]} />
          <Bar dataKey="Expense" fill="#94a3b8" radius={[8,8,0,0]} />
          <Bar dataKey="Savings" fill={EMERALD[300]} radius={[8,8,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
