const Table = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">{children}</table>
      </div>
    </div>
  );
};

const TableHeader = ({ children }) => {
  return (
    <thead>
      <tr className="bg-slate-800 text-slate-200 uppercase text-[11px] tracking-widest font-bold">
        {children}
      </tr>
    </thead>
  );
};

const TableHeaderCell = ({ children, align = "left", className = "" }) => {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <th scope="col" className={`px-6 py-4 ${alignClass[align]} ${className}`}>
      {children}
    </th>
  );
};

const TableBody = ({ children }) => {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
};

const TableRow = ({ children, onClick, className = "" }) => {
  return (
    <tr
      onClick={onClick}
      className={`hover:bg-slate-50 transition-colors group ${className}`}
    >
      {children}
    </tr>
  );
};

const TableCell = ({ children, className = "" }) => {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>;
};

export { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell };
