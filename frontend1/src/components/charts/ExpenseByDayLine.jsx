import React from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { EMERALD, GREYS } from "../../theme";

export default function ExpenseByDayLine({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={GREYS.grid} />
          <XAxis dataKey="date" stroke={GREYS.axis} />
          <YAxis stroke={GREYS.axis} />
          <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${GREYS.border}` }} />
          <Line type="monotone" dataKey="total" stroke={EMERALD[600]} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
