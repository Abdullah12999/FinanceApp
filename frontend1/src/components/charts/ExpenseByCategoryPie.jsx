import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { EMERALD, GREYS } from "../../theme";

export default function ExpenseByCategoryPie({ data }) {
  const palette = [EMERALD[600], EMERALD[500], EMERALD[400], EMERALD[300], EMERALD[700], EMERALD[200]];
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie dataKey="value" data={data} nameKey="name" outerRadius={90}>
            {data.map((_, idx) => <Cell key={idx} fill={palette[idx % palette.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${GREYS.border}` }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
