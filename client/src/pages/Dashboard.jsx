import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LineChart, Line, CartesianGrid, Legend } from "recharts";
import abstractBg from "/Abstract.jpg";

export default function Dashboard() {
  const [clienti, setClienti] = useState([]);
  const [appuntamenti, setAppuntamenti] = useState([]);
  const [sdgList, setSdgList] = useState([]);
  const [appuntamentiSdgGroup, setAppuntamentiSdgGroup] = useState([]);
  // Add state for tasks
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/clienti`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setClienti);

    fetch(`${import.meta.env.VITE_API_URL}/appuntamenti?withDetails=1`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setAppuntamenti);

    fetch(`${import.meta.env.VITE_API_URL}/sdg-group`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setSdgList);

    fetch(`${import.meta.env.VITE_API_URL}/appuntamenti-sdg-group`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setAppuntamentiSdgGroup);

    // Fetch tasks in useEffect
    fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(setTasks);
  }, []);

  // Card 1: # Banking clienti with at least one ongoing or to start appuntamenti
  const bankingClientiCount = useMemo(() => {
    const bankingClienti = clienti.filter(c => c.settore === "Banking").map(c => c.denominazione_cliente);
    const relevant = new Set(
      appuntamenti
        .filter(
          a =>
            (a.esito === "ongoing" || a.esito === "to start" || a.esito === "ritorno" || a.esito === "da fare" || a.esito === "attesa feedback") &&
            bankingClienti.includes(
              clienti.find(c => c.id === a.id_cliente)?.denominazione_cliente
            )
        )
        .map(a => a.id_cliente)
    );
    return relevant.size;
  }, [clienti, appuntamenti]);

  // Card 2: # Insurance clienti with at least one ongoing or to start appuntamenti
  const insuranceClientiCount = useMemo(() => {
    const insuranceClienti = clienti.filter(c => c.settore === "Insurance").map(c => c.denominazione_cliente);
    const relevant = new Set(
      appuntamenti
        .filter(
          a =>
            (a.esito === "ongoing" || a.esito === "to start" || a.esito === "ritorno" || a.esito === "da fare" || a.esito === "attesa feedback") &&
            insuranceClienti.includes(
              clienti.find(c => c.id === a.id_cliente)?.denominazione_cliente
            )
        )
        .map(a => a.id_cliente)
    );
    return relevant.size;
  }, [clienti, appuntamenti]);

  // Card 2: #seen/#total for insurance clienti as percentage
  const insuranceSeenCount = useMemo(() => {
    const insuranceClienti = clienti.filter(c => c.settore === "Insurance").map(c => c.denominazione_cliente);
    const seen = new Set(
      appuntamenti
        .filter(a =>
          insuranceClienti.includes(
            clienti.find(c => c.id === a.id_cliente)?.denominazione_cliente
          )
        )
        .map(a => a.id_cliente)
    );
    return seen.size;
  }, [clienti, appuntamenti]);
  const insuranceTotalCount = useMemo(() => {
    return new Set(clienti.filter(c => c.settore === "Insurance").map(c => c.denominazione_cliente)).size;
  }, [clienti]);
  const insuranceSeenPercent = useMemo(() => {
    if (!insuranceTotalCount) return "0%";
    return `${Math.round((insuranceSeenCount / insuranceTotalCount) * 100)}%`;
  }, [insuranceSeenCount, insuranceTotalCount]);

  // Card 3: # of future appuntamenti
  const futureAppuntamentiCount = useMemo(() => {
    const now = new Date();
    return appuntamenti.filter(a => a.data && new Date(a.data) > now).length;
  }, [appuntamenti]);

  // Card 4: # of incomplete tasks
  const toReviewCount = useMemo(() => {
    return tasks.filter(t => t.status === false).length;
  }, [tasks]);

  // Chart 1: appuntamenti per SDG Business Unit (horizontal bar)
  const appuntamentiPerBU = useMemo(() => {
    // Join appuntamenti_sdg_group with sdg_group to get business_unit
    const buCounts = {};
    appuntamentiSdgGroup.forEach(a => {
      // Find the sdg_group for this id_sdg
      const sdg = sdgList.find(s => s.id === a.id_sdg);
      const bu = sdg?.business_unit || "N/A";
      buCounts[bu] = (buCounts[bu] || 0) + 1;
    });
    // Sort descending by appuntamenti
    return Object.entries(buCounts)
      .map(([business_unit, appuntamenti]) => ({
        business_unit,
        appuntamenti,
      }))
      .sort((a, b) => b.appuntamenti - a.appuntamenti);
  }, [appuntamentiSdgGroup, sdgList]);

  const bankingClientiList = useMemo(() => {
    const bankingClienti = clienti.filter(c => c.settore === "Banking");
    const relevantIds = new Set(
      appuntamenti
        .filter(
          a =>
            (a.esito === "ongoing" || a.esito === "to start" || a.esito === "ritorno" || a.esito === "da fare" || a.esito === "attesa feedback") &&
            bankingClienti.some(c => c.id === a.id_cliente)
        )
        .map(a => a.id_cliente)
    );
    return bankingClienti
      .filter(c => relevantIds.has(c.id))
      .map(c => c.denominazione_cliente)
      .sort((a, b) => a.localeCompare(b));
  }, [clienti, appuntamenti]);

  const insuranceClientiList = useMemo(() => {
    const insuranceClienti = clienti.filter(c => c.settore === "Insurance");
    const relevantIds = new Set(
      appuntamenti
        .filter(
          a =>
            (a.esito === "ongoing" || a.esito === "to start" || a.esito === "ritorno" || a.esito === "da fare" || a.esito === "attesa feedback") &&
            insuranceClienti.some(c => c.id === a.id_cliente)
        )
        .map(a => a.id_cliente)
    );
    return insuranceClienti
      .filter(c => relevantIds.has(c.id))
      .map(c => c.denominazione_cliente)
      .sort((a, b) => a.localeCompare(b));
  }, [clienti, appuntamenti]);

  const bankingClientiSeenList = useMemo(() => {
    const bankingClienti = clienti.filter(c => c.settore === "Banking");
    const seenIds = new Set(
      appuntamenti
        .filter(a => bankingClienti.some(c => c.id === a.id_cliente))
        .map(a => a.id_cliente)
    );
    return bankingClienti
      .filter(c => seenIds.has(c.id))
      .map(c => c.denominazione_cliente)
      .sort((a, b) => a.localeCompare(b));
  }, [clienti, appuntamenti]);

  const insuranceClientiSeenList = useMemo(() => {
    const insuranceClienti = clienti.filter(c => c.settore === "Insurance");
    const seenIds = new Set(
      appuntamenti
        .filter(a => insuranceClienti.some(c => c.id === a.id_cliente))
        .map(a => a.id_cliente)
    );
    return insuranceClienti
      .filter(c => seenIds.has(c.id))
      .map(c => c.denominazione_cliente)
      .sort((a, b) => a.localeCompare(b));
  }, [clienti, appuntamenti]);

  const bankingClientiSeenCount = bankingClientiSeenList.length;
  const insuranceClientiSeenCount = insuranceClientiSeenList.length;

  // Chart 2: Only show months up to now, and show totals in legend
  const now = new Date();
  const currentMonthIdx = now.getFullYear() === 2025 ? now.getMonth() : 11; // 0-based, up to current month if 2025, else all

  const months2025 = [
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
  ];
  const monthsLabels = [
    "Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"
  ];

  const chart2Data = useMemo(() => {
    const bankingIds = new Set(clienti.filter(c => c.settore === "Banking").map(c => c.id));
    const insuranceIds = new Set(clienti.filter(c => c.settore === "Insurance").map(c => c.id));
    const data = months2025.map((m, i) => ({
      month: monthsLabels[i],
      banking: 0,
      insurance: 0,
    }));

    appuntamenti.forEach(a => {
      if (!a.data) return;
      const date = new Date(a.data);
      if (date.getFullYear() !== 2025) return;
      const monthIdx = date.getMonth();
      if (bankingIds.has(a.id_cliente)) data[monthIdx].banking += 1;
      if (insuranceIds.has(a.id_cliente)) data[monthIdx].insurance += 1;
    });

    // Only show months up to current month (inclusive)
    return data.slice(0, currentMonthIdx + 1);
  }, [appuntamenti, clienti, currentMonthIdx]);

  // Calculate totals for legend
  const bankingTotal = chart2Data.reduce((sum, d) => sum + d.banking, 0);
  const insuranceTotal = chart2Data.reduce((sum, d) => sum + d.insurance, 0);

  // Custom legend for totals
  const CustomLegend = () => (
    <div style={{ display: "flex", gap: 24, fontWeight: 500, fontSize: 16, marginBottom: 8 }}>
      <span style={{ color: "#2A66DD" }}>Banking: {bankingTotal}</span>
      <span style={{ color: "#1DC8DF" }}>Insurance: {insuranceTotal}</span>
    </div>
  );

  return (
    <div
      style={{
        height: "100vh",
        maxWidth: "100vw",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundImage: `url(${abstractBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        padding: "32px",
        paddingTop: "120px",
      }}
    >
      {/* Top 4 cards */}
      <div className="w-full flex flex-wrap justify-center gap-4 bg-white/70 rounded-xl p-4">
        {[{
          title: "Azioni attive banking",
          value: bankingClientiCount,
          tooltipList: bankingClientiList
        }, {
          title: "Azioni attive insurance",
          value: insuranceClientiCount,
          indicator: insuranceSeenPercent,
          tooltipList: insuranceClientiList
        }, {
          title: "Clienti visti banking",
          value: bankingClientiSeenCount,
          tooltipList: bankingClientiSeenList
        }, {
          title: "Clienti visti insurance",
          value: insuranceClientiSeenCount,
          tooltipList: insuranceClientiSeenList
        }].map((card, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[180px] w-[22vw] transition-all hover:scale-105 relative group"
          >
            <div className="text-lg font-semibold text-blue-900 mb-2 text-center">{card.title}</div>
            <div className="text-4xl font-bold text-blue-700 text-center">{card.value}</div>
            {card.indicator && (
              <div className="text-sm text-blue-900 font-medium text-center mt-2">
                {card.indicator} del totale.
              </div>
            )}
            {/*
            {card.tooltipList && card.tooltipList.length > 0 && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white border border-gray-300 rounded shadow-lg p-4 text-sm text-gray-900 max-h-60 overflow-auto opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200"
                style={{
                  minWidth: 340,
                  zIndex: 99999, // Only here, not on chart container
                  whiteSpace: "normal",
                }}
              >
                <div className="font-semibold mb-2">Aziende incluse:</div>
                <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                  {card.tooltipList.map(name => (
                    <li key={name} style={{ marginBottom: 2 }}>{name}</li>
                  ))}
                </ul>
              </div>
            )}
            */}
          </div>
        ))}
      </div>
      {/* Bottom 3 charts */}
      <div className="w-full flex flex-wrap justify-center gap-4">
        {/* Chart 1: Horizontal Bar Chart */}
        <div className="bg-gray-100 rounded-lg shadow p-8 flex flex-col items-center min-h-[400px] w-[30vw]">
          <div className="text-lg font-semibold text-blue-900 mb-4 text-center">
            Appuntamenti per Business Unit SDG
          </div>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={appuntamentiPerBU}
                margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
              >
                <XAxis type="number" tick={{ fontSize: 12 }}/>
                <YAxis dataKey="business_unit" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="appuntamenti" fill="#2A66DD" barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Chart 2: Line Chart */}
        <div className="bg-gray-100 rounded-lg shadow p-8 flex flex-col items-center min-h-[400px] w-[30vw] chart-z-low">
          <div className="text-lg font-semibold text-blue-900 mb-4 text-center">
            Appuntamenti per mese 2025
          </div>
          <div style={{ width: "100%", height: 320, position: "relative" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart2Data} margin={{ top: 10, right: 5, left: 0, bottom: 20 }}>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="banking" name="Banking" stroke="#2A66DD" strokeWidth={3} dot />
                <Line type="monotone" dataKey="insurance" name="Insurance" stroke="#1DC8DF" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Custom legend UNDER the chart */}
          <CustomLegend />
        </div>
        {/* Chart 3 placeholder */}
        <div
          className="bg-gray-100 rounded-lg shadow p-8 flex flex-col items-center min-h-[400px] w-[30vw] justify-center"
        >
          <div className="text-2xl font-semibold text-blue-900 text-center">
            Coming Soon ...
          </div>
        </div>
      </div>
    </div>
  );
}