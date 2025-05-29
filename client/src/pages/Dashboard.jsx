import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
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
            (a.esito === "ongoing" || a.esito === "to start") &&
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
            (a.esito === "ongoing" || a.esito === "to start") &&
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
          value: bankingClientiCount
        }, {
          title: "Azioni attive insurance",
          value: insuranceClientiCount,
          indicator: insuranceSeenPercent
        }, {
          title: "Appuntamenti futuri",
          value: futureAppuntamentiCount
        }, {
          title: "Task da completare",
          value: toReviewCount
        }].map((card, i) => (
          <div
            key={i}
            className="bg-gray-100 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center min-h-[180px] w-[22vw] transition-all hover:scale-105"
          >
            <div className="text-lg font-semibold text-blue-900 mb-2 text-center">{card.title}</div>
            <div className="text-4xl font-bold text-blue-700 text-center">{card.value}</div>
            {card.indicator && (
              <div className="text-sm text-blue-900 font-medium text-center mt-2">
                {card.indicator} del totale.
              </div>
            )}
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
        {/* Chart 2 & 3 placeholders */}
        {[2, 3].map(i => (
          <div
            key={i}
            className="bg-gray-100 rounded-lg shadow p-8 flex flex-col items-center min-h-[400px] w-[30vw] justify-center"
          >
            <div className="text-2xl font-semibold text-blue-900 text-center">
              Coming Soon ...
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}